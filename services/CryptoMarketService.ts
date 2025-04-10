import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockCryptoMarketData } from "../utils/mockCryptoData";

const MARKET_DATA_CACHE_KEY = "@crypto_market_data";
const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes (increased to reduce API calls)
const RATE_LIMIT_CACHE_KEY = "@crypto_rate_limit";
const RATE_LIMIT_RESET_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY = 5000; // 5 seconds

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const DEFAULT_PARAMS = {
  vs_currency: "usd",
  order: "market_cap_desc",
  per_page: "20",
  page: "1",
  sparkline: "false",
  price_change_percentage: "24h"
};

// Rate limit tracking
interface RateLimitInfo {
  timestamp: number;
  count: number;
  isLimited: boolean;
}

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  last_updated?: number; // Optional timestamp for tracking updates
}

interface CacheData {
  timestamp: number;
  data: CryptoCurrency[];
}

export class CryptoMarketService {
  static async fetchMarketData(forceRefresh = false): Promise<CryptoCurrency[]> {
    // Always check cache first unless forced refresh
    if (!forceRefresh) {
      const cachedData = await this.loadFromCache();
      if (cachedData) {
        console.log("Using cached market data");
        return cachedData;
      }
    }

    // Check if we're rate limited
    const rateLimited = await this.isRateLimited();
    if (rateLimited) {
      console.log("Rate limited, using fallback data");
      // Try to use cached data even if expired
      const expiredCache = await this.loadFromCache(true);
      if (expiredCache) {
        return expiredCache;
      }
      // If no cache available, use mock data
      return mockCryptoMarketData;
    }

    // Track this API call
    await this.trackApiCall();

    try {
      return await this.fetchWithRetry();
    } catch (error) {
      console.error("Error fetching market data:", error);
      
      // If we get a 429 error, mark as rate limited
      if (error instanceof Error) {
        console.error(`API Error: ${error.message}`);
        if (error.message.includes("429")) {
          console.warn("Rate limit exceeded - marking as limited");
          await this.markRateLimited();
        }
      }
      
      // Try to use cached data even if expired
      const cachedData = await this.loadFromCache(true);
      if (cachedData) {
        return cachedData;
      }
      
      // Last resort: use mock data
      return mockCryptoMarketData;
    }
  }

  private static async fetchWithRetry(retryCount = 0): Promise<CryptoCurrency[]> {
    try {
      const url = new URL(COINGECKO_API_URL);
      Object.entries(DEFAULT_PARAMS).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      await this.saveToCache(data);
      return data;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying API call in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(retryCount + 1);
      }
      throw error;
    }
  }

  private static async isRateLimited(): Promise<boolean> {
    try {
      const rateLimitJson = await AsyncStorage.getItem(RATE_LIMIT_CACHE_KEY);
      if (rateLimitJson) {
        const rateLimit = JSON.parse(rateLimitJson) as RateLimitInfo;
        
        // Check if we're in a rate-limited state
        if (rateLimit.isLimited) {
          // Check if rate limit period has expired
          if (Date.now() - rateLimit.timestamp > RATE_LIMIT_RESET_TIME) {
            // Reset rate limit
            await this.resetRateLimit();
            return false;
          }
          return true;
        }
        
        // Check if we've made too many requests recently
        if (Date.now() - rateLimit.timestamp < RATE_LIMIT_RESET_TIME && rateLimit.count >= 5) {
          await this.markRateLimited();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return false;
    }
  }

  private static async trackApiCall(): Promise<void> {
    try {
      const rateLimitJson = await AsyncStorage.getItem(RATE_LIMIT_CACHE_KEY);
      let rateLimit: RateLimitInfo;
      
      if (rateLimitJson) {
        rateLimit = JSON.parse(rateLimitJson) as RateLimitInfo;
        
        // Reset count if time window has passed
        if (Date.now() - rateLimit.timestamp > RATE_LIMIT_RESET_TIME) {
          rateLimit = {
            timestamp: Date.now(),
            count: 1,
            isLimited: false
          };
        } else {
          // Increment count
          rateLimit.count += 1;
        }
      } else {
        // Initialize rate limit tracking
        rateLimit = {
          timestamp: Date.now(),
          count: 1,
          isLimited: false
        };
      }
      
      await AsyncStorage.setItem(RATE_LIMIT_CACHE_KEY, JSON.stringify(rateLimit));
    } catch (error) {
      console.error("Error tracking API call:", error);
    }
  }

  private static async markRateLimited(): Promise<void> {
    try {
      const rateLimit: RateLimitInfo = {
        timestamp: Date.now(),
        count: 5,
        isLimited: true
      };
      await AsyncStorage.setItem(RATE_LIMIT_CACHE_KEY, JSON.stringify(rateLimit));
    } catch (error) {
      console.error("Error marking rate limited:", error);
    }
  }

  private static async resetRateLimit(): Promise<void> {
    try {
      const rateLimit: RateLimitInfo = {
        timestamp: Date.now(),
        count: 0,
        isLimited: false
      };
      await AsyncStorage.setItem(RATE_LIMIT_CACHE_KEY, JSON.stringify(rateLimit));
    } catch (error) {
      console.error("Error resetting rate limit:", error);
    }
  }

  private static async saveToCache(data: CryptoCurrency[]): Promise<void> {
    try {
      const cacheData: CacheData = {
        timestamp: Date.now(),
        data,
      };
      await AsyncStorage.setItem(
        MARKET_DATA_CACHE_KEY,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  }

  private static async loadFromCache(ignoreExpiry = false): Promise<CryptoCurrency[] | null> {
    try {
      const cachedJson = await AsyncStorage.getItem(MARKET_DATA_CACHE_KEY);
      if (cachedJson) {
        const { timestamp, data } = JSON.parse(cachedJson) as CacheData;
        if (ignoreExpiry || Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading from cache:", error);
      return null;
    }
  }
}
