import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CryptoMarketService, type CryptoCurrency } from "../services/CryptoMarketService";
import { CryptoWebSocketService } from "../services/CryptoWebSocketService";
import { AppState, type AppStateStatus } from "react-native";
import { mockCryptoMarketData } from "../utils/mockCryptoData";

type ConnectionStatus = "connected" | "disconnected" | "connecting";

interface UseCryptoMarketOptions {
  symbolMap: Record<string, string>;
  refreshInterval?: number;
}

export function useCryptoMarket({ 
  symbolMap,
  refreshInterval = 300000 // 5 minutes
}: UseCryptoMarketOptions) {
  const [marketData, setMarketData] = useState<CryptoCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const webSocketServiceRef = useRef<CryptoWebSocketService | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const webSocketReconnectAttemptRef = useRef(0);

  // Debounce fetch requests to prevent rapid successive calls
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchMarketData = useCallback(async (forceRefresh = false) => {
    // Cancel any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If not force refresh, check if we have recent data
    if (!forceRefresh && marketData.length > 0) {
      const lastUpdated = marketData[0]?.last_updated;
      if (lastUpdated && Date.now() - lastUpdated < 60000) { // 1 minute
        return;
      }
    }

    // Debounce non-force requests by 500ms
    if (!forceRefresh) {
      debounceTimeoutRef.current = setTimeout(async () => {
        await doFetchMarketData(forceRefresh);
      }, 500);
      return;
    }

    // Force refresh goes immediately
    await doFetchMarketData(forceRefresh);
  }, [marketData.length, symbolMap]);

  const doFetchMarketData = useCallback(async (forceRefresh: boolean) => {
    try {
      // Skip if we're already loading
      if (isLoading && !forceRefresh) return;
      setIsLoading(!forceRefresh && marketData.length === 0);
      setIsRefreshing(forceRefresh);
      setError(null);

      // Batch API requests and cache handling with rate limit awareness
      const data = await CryptoMarketService.fetchMarketData(forceRefresh);
      
      // Check if we got mock data due to rate limiting
      const isMockData = data.length > 0 && 
        data[0].current_price === mockCryptoMarketData[0].current_price &&
        data[1].current_price === mockCryptoMarketData[1].current_price;
      
      // Optimized state update
      setMarketData((prev) => {
        const newData = data.map(newItem => {
          const existing = prev.find(item => item.id === newItem.id);
          return existing ? {...existing, ...newItem} : newItem;
        });
        return newData;
      });

      setIsLoading(false);
      setIsRefreshing(false);
      
      // Set a warning if we're using mock data
      if (isMockData) {
        setError("Using demo data due to API rate limits. Prices may not be current.");
      }

      // Only connect WebSocket if we're not using mock data
      if (!isMockData) {
        // Optimized WebSocket connection
        const symbols = data
          .slice(0, 10) // Only connect top 10 to reduce load
          .map((crypto) => symbolMap[crypto.id])
          .filter(Boolean);

        if (symbols.length > 0) {
          if (!webSocketServiceRef.current) {
            webSocketServiceRef.current = new CryptoWebSocketService({
              onMessage: ({ id, price, priceChangePercentage24h }) => {
                setMarketData((prev) =>
                  prev.map((crypto) =>
                    crypto.id === id
                      ? {
                          ...crypto,
                          current_price: price,
                          price_change_percentage_24h: priceChangePercentage24h,
                          last_updated: Date.now() // Track update time
                        }
                      : crypto
                  )
                );
              },
              onStatusChange: (status) => {
                setConnectionStatus(status);
                if (status === "disconnected") {
                  // Schedule reconnect attempt with increasing delay
                  const reconnectDelay = Math.min(
                    5000 * Math.pow(2, webSocketReconnectAttemptRef.current),
                    30000
                  );
                  webSocketReconnectAttemptRef.current++;
                  
                  setTimeout(() => {
                    if (appStateRef.current === "active") {
                      fetchMarketData(false);
                    }
                  }, reconnectDelay);
                } else if (status === "connected") {
                  // Reset reconnect attempts on successful connection
                  webSocketReconnectAttemptRef.current = 0;
                }
              },
            });
          } else {
            webSocketServiceRef.current.disconnect();
          }
          webSocketServiceRef.current.connect(symbols);
        }
      } else {
        // Disconnect WebSocket if using mock data
        if (webSocketServiceRef.current) {
          webSocketServiceRef.current.disconnect();
        }
        setConnectionStatus("disconnected");
      }
    } catch (err) {
      console.error("Error in fetchMarketData:", err);
      setError((err as Error).message || "Failed to load market data");
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [marketData.length, symbolMap]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background
        if (webSocketServiceRef.current) {
          webSocketServiceRef.current.disconnect();
        }
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App coming to foreground
        fetchMarketData();
        refreshIntervalRef.current = setInterval(
          () => fetchMarketData(),
          refreshInterval
        );
      }
      appStateRef.current = nextAppState;
    },
    [fetchMarketData, refreshInterval]
  );

  const filteredMarketData = useMemo(() => {
    if (!searchQuery) return marketData;

    return marketData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [marketData, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      await fetchMarketData();
      
      if (isMounted) {
        refreshIntervalRef.current = setInterval(
          () => fetchMarketData(),
          refreshInterval
        );
      }
    };

    init();

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      isMounted = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (webSocketServiceRef.current) {
        webSocketServiceRef.current.disconnect();
      }
      appStateSubscription.remove();
    };
  }, [fetchMarketData, handleAppStateChange, refreshInterval]);

  return {
    marketData: filteredMarketData,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    connectionStatus,
    refresh: () => fetchMarketData(true),
  };
}
