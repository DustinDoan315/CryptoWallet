import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  AppState,
  Animated,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ethers } from "ethers";

// Define types for cryptocurrency data
interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  // Add blockchain-specific fields
  contractAddress?: string;
  blockchain?: string;
}

// Cache constants
const MARKET_DATA_CACHE_KEY = "@crypto_market_data";
const CACHE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const REFRESH_INTERVAL = 60 * 1000; // 60 seconds - respect API rate limits

// Web3 constants
const ETHEREUM_RPC_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"; // Replace with your key
const WEB3_ENABLED_KEY = "@crypto_web3_enabled";

const CryptoMarketScreen: React.FC = () => {
  const [marketData, setMarketData] = useState<CryptoCurrency[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(53145.76);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPrices, setLastPrices] = useState<Record<string, number>>({});
  const [priceFlashStates, setPriceFlashStates] = useState<
    Record<string, "up" | "down" | null>
  >({});
  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  // Web3 state
  const [isWeb3Enabled, setIsWeb3Enabled] = useState<boolean>(false);
  const [ethereumProvider, setEthereumProvider] =
    useState<ethers.providers.JsonRpcProvider | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  // Animation value for price flashing
  const priceAnimations = useRef<Record<string, Animated.Value>>({});

  // Enhanced interval reference with metadata
  interface EnhancedInterval {
    timerId: NodeJS.Timeout;
    lastFetchTime: number;
    retryCount: number;
  }

  const refreshIntervalRef = useRef<EnhancedInterval | null>(null);
  const retryCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const MAX_RETRIES = 3;

  // Initialize or get animation value for a crypto
  const getAnimationValue = (cryptoId: string) => {
    if (!priceAnimations.current[cryptoId]) {
      priceAnimations.current[cryptoId] = new Animated.Value(0);
    }
    return priceAnimations.current[cryptoId];
  };

  // Initialize Web3 connection
  const initializeWeb3 = useCallback(async () => {
    try {
      // Check if user has enabled Web3
      const isEnabled = await AsyncStorage.getItem(WEB3_ENABLED_KEY);
      const shouldEnableWeb3 = isEnabled === "true";
      setIsWeb3Enabled(shouldEnableWeb3);

      if (shouldEnableWeb3) {
        // Initialize provider
        const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_URL);
        setEthereumProvider(provider);
        console.log("Web3 provider initialized");

        // Load connected wallet address if available
        const savedAddress = await AsyncStorage.getItem(
          "@connected_wallet_address"
        );
        if (savedAddress) {
          setConnectedAddress(savedAddress);
          console.log("Connected to wallet:", savedAddress);
        }
      }
    } catch (error) {
      console.error("Error initializing Web3:", error);
    }
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (!isWeb3Enabled) {
      // Ask user if they want to enable Web3 features
      Alert.alert(
        "Enable Web3 Features",
        "Would you like to enable blockchain features for real crypto transactions?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Enable",
            onPress: async () => {
              await AsyncStorage.setItem(WEB3_ENABLED_KEY, "true");
              setIsWeb3Enabled(true);
              initializeWeb3();
            },
          },
        ]
      );
      return;
    }

    try {
      // In a real app, this would trigger wallet connection
      // For this example, we'll simulate a connection
      const mockAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      setConnectedAddress(mockAddress);
      await AsyncStorage.setItem("@connected_wallet_address", mockAddress);

      Alert.alert(
        "Wallet Connected",
        `Connected to ${mockAddress.substring(0, 6)}...${mockAddress.substring(
          38
        )}`
      );
    } catch (error) {
      console.error("Error connecting wallet:", error);
      Alert.alert("Connection Error", "Failed to connect to wallet");
    }
  };

  // Fetch token price from blockchain directly (simulated)
  const fetchOnChainPrice = async (tokenAddress: string) => {
    if (!ethereumProvider) return null;

    try {
      // This is a simplified example - in a real app you would:
      // 1. Use a price oracle contract or DEX contract
      // 2. Call the specific methods to get the price
      // 3. Format the returned data appropriately

      // For demo purposes, we'll return a simulated price
      return Math.random() * 1000;
    } catch (error) {
      console.error("Error fetching on-chain price:", error);
      return null;
    }
  };

  // Cache handling functions
  const saveToCache = async (data: CryptoCurrency[]) => {
    try {
      const cacheData = {
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
  };

  const loadFromCache = async (ignoreExpiry = false) => {
    try {
      const cachedJson = await AsyncStorage.getItem(MARKET_DATA_CACHE_KEY);
      if (cachedJson) {
        const { timestamp, data } = JSON.parse(cachedJson);

        // Build initial lastPrices object from cached data
        if (Object.keys(lastPrices).length === 0) {
          const initialPrices: Record<string, number> = {};
          data.forEach((crypto: CryptoCurrency) => {
            initialPrices[crypto.id] = crypto.current_price;
          });
          setLastPrices(initialPrices);
        }

        if (ignoreExpiry || Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading from cache:", error);
      return null;
    }
  };

  // Main data fetching function with error handling
  const fetchMarketData = useCallback(
    async (forceRefresh = false, silentUpdate = false) => {
      try {
        if (!silentUpdate) {
          setError(null);

          if (!forceRefresh) {
            setIsLoading(true);
          } else {
            setRefreshing(true);
          }
        }

        if (!forceRefresh) {
          const cachedData = await loadFromCache();
          if (cachedData) {
            setMarketData(cachedData);

            if (!silentUpdate) {
              setIsLoading(false);
            }

            return;
          }
        }

        // Create AbortController for fetch timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Fetch fresh data from API
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1",
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new Error("Rate limit reached");
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Enhance data with blockchain information (example contract addresses)
        const enhancedData = data.map((crypto: CryptoCurrency) => {
          let contractAddress = "";
          let blockchain = "";

          // Add example contract addresses for well-known tokens
          if (crypto.symbol === "eth") {
            blockchain = "Ethereum";
          } else if (crypto.symbol === "usdt") {
            contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
            blockchain = "Ethereum";
          } else if (crypto.symbol === "usdc") {
            contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
            blockchain = "Ethereum";
          } else if (crypto.symbol === "bnb") {
            blockchain = "BNB Smart Chain";
          }

          return {
            ...crypto,
            contractAddress,
            blockchain,
          };
        });

        // Calculate price changes for visual indicators
        const newFlashStates: Record<string, "up" | "down" | null> = {};
        const newPrices: Record<string, number> = {};

        enhancedData.forEach((crypto: CryptoCurrency) => {
          // Store the current price for next comparison
          newPrices[crypto.id] = crypto.current_price;

          // Check if price changed from last known price
          if (lastPrices[crypto.id] !== undefined) {
            if (crypto.current_price > lastPrices[crypto.id]) {
              newFlashStates[crypto.id] = "up";
              const animValue = getAnimationValue(crypto.id);
              animValue.setValue(0);
              Animated.sequence([
                Animated.timing(animValue, {
                  toValue: 1,
                  duration: 250,
                  useNativeDriver: false,
                }),
                Animated.timing(animValue, {
                  toValue: 0,
                  duration: 250,
                  useNativeDriver: false,
                }),
              ]).start();
            } else if (crypto.current_price < lastPrices[crypto.id]) {
              newFlashStates[crypto.id] = "down";
              const animValue = getAnimationValue(crypto.id);
              animValue.setValue(0);
              Animated.sequence([
                Animated.timing(animValue, {
                  toValue: 1,
                  duration: 250,
                  useNativeDriver: false,
                }),
                Animated.timing(animValue, {
                  toValue: 0,
                  duration: 250,
                  useNativeDriver: false,
                }),
              ]).start();
            }
          }
        });

        // Only update if the component is still mounted
        if (isMountedRef.current) {
          setMarketData(enhancedData);
          setPriceFlashStates(newFlashStates);
          setLastPrices(newPrices);
          retryCountRef.current = 0;

          // Clear price flash states after animation completes
          setTimeout(() => {
            if (isMountedRef.current) {
              setPriceFlashStates({});
            }
          }, 500);

          // Cache the data
          await saveToCache(enhancedData);
        }
      } catch (error: any) {
        console.error("Error fetching market data:", error);

        // Special handling for rate limiting
        if (error.message === "Rate limit reached") {
          console.log("Rate limit reached, will try again in 60 seconds");
          if (!silentUpdate) {
            setError("API rate limit reached. Using cached data.");
          }
        } else if (!silentUpdate && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          console.log(
            `Retrying fetch (${retryCountRef.current}/${MAX_RETRIES})...`
          );

          // Exponential backoff for retries
          const backoffTime = Math.pow(2, retryCountRef.current) * 1000;
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchMarketData(forceRefresh, silentUpdate);
            }
          }, backoffTime);
        } else if (!silentUpdate) {
          setError("Failed to load market data. Pull down to retry.");

          // If cache exists, load stale data as fallback
          const cachedData = await loadFromCache(true);
          if (cachedData && isMountedRef.current) {
            setMarketData(cachedData);
          }
        }
      } finally {
        if (!silentUpdate && isMountedRef.current) {
          setIsLoading(false);
          setRefreshing(false);
        }
      }
    },
    [lastPrices]
  );

  // Manual refresh handler
  const onRefresh = useCallback(() => {
    fetchMarketData(true);
  }, [fetchMarketData]);

  // Toggle balance visibility
  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  // App state change handler to manage background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState);

      // If app comes to foreground, immediately fetch data
      if (nextAppState === "active" && appStateVisible !== "active") {
        fetchMarketData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appStateVisible, fetchMarketData]);

  // Initialize Web3 on component mount
  useEffect(() => {
    initializeWeb3();
  }, [initializeWeb3]);

  // Set up data fetching and polling
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    // Initial data fetch
    fetchMarketData();

    // Function to refresh data with rate limiting
    const refreshData = () => {
      if (appStateVisible === "active" && isMountedRef.current) {
        // Check last fetch time to avoid rate limiting
        const now = Date.now();
        const lastFetchTime = refreshIntervalRef.current?.lastFetchTime || 0;

        if (now - lastFetchTime < 30000) {
          console.log(
            "Skipping fetch to avoid rate limiting (30s minimum between requests)"
          );
          return;
        }

        // Update last fetch time
        if (refreshIntervalRef.current) {
          refreshIntervalRef.current.lastFetchTime = now;
        }

        console.log("Fetching fresh market data...");

        fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1",
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        )
          .then((response) => {
            if (response.status === 429) {
              console.log("Rate limit reached, will try again later");
              throw new Error("Rate limit reached");
            }
            if (!response.ok) {
              throw new Error(
                `API request failed with status ${response.status}`
              );
            }
            return response.json();
          })
          .then((data) => {
            if (!isMountedRef.current) return;

            // Add blockchain information
            const enhancedData = data.map((crypto: CryptoCurrency) => {
              let contractAddress = "";
              let blockchain = "";

              if (crypto.symbol === "eth") {
                blockchain = "Ethereum";
              } else if (crypto.symbol === "usdt") {
                contractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
                blockchain = "Ethereum";
              } else if (crypto.symbol === "usdc") {
                contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
                blockchain = "Ethereum";
              } else if (crypto.symbol === "bnb") {
                blockchain = "BNB Smart Chain";
              }

              return {
                ...crypto,
                contractAddress,
                blockchain,
              };
            });

            // Calculate price changes for visual indicators
            const newFlashStates: Record<string, "up" | "down" | null> = {};
            const newPrices: Record<string, number> = {};

            enhancedData.forEach((crypto: CryptoCurrency) => {
              // Store the current price for next comparison
              newPrices[crypto.id] = crypto.current_price;

              // Check if price changed from last known price
              if (lastPrices[crypto.id] !== undefined) {
                if (crypto.current_price > lastPrices[crypto.id]) {
                  newFlashStates[crypto.id] = "up";
                  // Get animation value and trigger animation
                  const animValue = getAnimationValue(crypto.id);
                  animValue.setValue(0);
                  Animated.sequence([
                    Animated.timing(animValue, {
                      toValue: 1,
                      duration: 250,
                      useNativeDriver: false,
                    }),
                    Animated.timing(animValue, {
                      toValue: 0,
                      duration: 250,
                      useNativeDriver: false,
                    }),
                  ]).start();
                } else if (crypto.current_price < lastPrices[crypto.id]) {
                  newFlashStates[crypto.id] = "down";
                  // Get animation value and trigger animation
                  const animValue = getAnimationValue(crypto.id);
                  animValue.setValue(0);
                  Animated.sequence([
                    Animated.timing(animValue, {
                      toValue: 1,
                      duration: 250,
                      useNativeDriver: false,
                    }),
                    Animated.timing(animValue, {
                      toValue: 0,
                      duration: 250,
                      useNativeDriver: false,
                    }),
                  ]).start();
                }
              }
            });

            setMarketData(enhancedData);
            setPriceFlashStates(newFlashStates);
            setLastPrices(newPrices);

            // Cache the data
            saveToCache(enhancedData);

            // Clear price flash states after animation completes
            setTimeout(() => {
              if (isMountedRef.current) {
                setPriceFlashStates({});
              }
            }, 500);
          })
          .catch((error) => {
            console.error("Auto-refresh error:", error);
          });
      }
    };

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current.timerId);
      refreshIntervalRef.current = null;
    }

    // Create an enhanced interval reference with metadata
    refreshIntervalRef.current = {
      timerId: setInterval(refreshData, REFRESH_INTERVAL),
      lastFetchTime: Date.now(),
      retryCount: 0,
    };

    console.log("📱 Set up auto-refresh interval:", REFRESH_INTERVAL, "ms");

    // Cleanup on unmount
    return () => {
      console.log("📱 Cleaning up refresh interval");
      isMountedRef.current = false;

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current.timerId);
        refreshIntervalRef.current = null;
      }
    };
  }, [appStateVisible, lastPrices]);

  // Filtered data based on search query
  const filteredMarketData = searchQuery
    ? marketData.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : marketData;

  // Render cryptocurrency list item
  const CryptoListItem = ({ item }: { item: CryptoCurrency }) => {
    const isPriceDown = item.price_change_percentage_24h < 0;
    const priceState = priceFlashStates[item.id];
    const animValue = getAnimationValue(item.id);

    // Calculate background color for price change flash animation
    const backgroundColor = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "transparent",
        priceState === "up"
          ? "rgba(0, 255, 0, 0.15)"
          : priceState === "down"
          ? "rgba(255, 0, 0, 0.15)"
          : "transparent",
      ],
    });

    // Calculate price text color
    const priceColor =
      priceState === "up"
        ? "#4cd964"
        : priceState === "down"
        ? "#ff3b30"
        : "white";

    return (
      <TouchableOpacity
        style={styles.cryptoItem}
        onPress={() => {
          router.push(`/(subs)/crypto-detail?id=${item.id}`);
        }}>
        <Animated.View
          style={[styles.cryptoItemBackground, { backgroundColor }]}
        />
        <View style={styles.cryptoIconContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.cryptoIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.cryptoInfo}>
          <Text style={styles.cryptoSymbol}>
            {item.symbol.toUpperCase()}
            {item.blockchain && (
              <Text style={styles.blockchainLabel}> • {item.blockchain}</Text>
            )}
          </Text>
          <Text style={styles.cryptoName}>{item.name}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.priceText, { color: priceColor }]}>
            {formatCurrency(item.current_price)}
          </Text>
          <View
            style={[
              styles.percentageContainer,
              isPriceDown ? styles.percentageDown : styles.percentageUp,
            ]}>
            <Text style={styles.percentageText}>
              {formatPercentage(item.price_change_percentage_24h)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="grid" size={24} color="white" />
          <Text style={styles.headerTitle}>Crypto Market</Text>
        </View>

        {/* Web3 Connect Button */}
        <TouchableOpacity
          style={[
            styles.connectButton,
            connectedAddress
              ? styles.connectedButton
              : styles.disconnectedButton,
          ]}
          onPress={connectWallet}>
          <Text style={styles.connectButtonText}>
            {connectedAddress
              ? `${connectedAddress.substring(
                  0,
                  4
                )}...${connectedAddress.substring(38)}`
              : "Connect Wallet"}
          </Text>
          {connectedAddress && <View style={styles.connectedDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#3498db"]}
          />
        }>
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Tổng giá trị ước tính</Text>
            <TouchableOpacity onPress={toggleBalanceVisibility}>
              <Ionicons
                name={isBalanceHidden ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {isBalanceHidden
                ? "••••••••"
                : formatCurrency(totalBalance, "", 2)}
            </Text>
            <TouchableOpacity style={styles.currencySelector}>
              <Text style={styles.currencyText}>{selectedCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Market List Header */}
        <View style={styles.marketHeader}>
          <Text style={styles.marketHeaderTitle}>Top Cryptocurrencies</Text>
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={18}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Column Headers */}
        <View style={styles.columnHeaders}>
          <Text style={styles.columnHeaderText}>Asset</Text>
          <Text style={[styles.columnHeaderText, styles.rightAligned]}>
            Price
          </Text>
          <Text style={[styles.columnHeaderText, styles.rightAligned]}>
            24h Change
          </Text>
        </View>

        {/* Loading Indicator or Error Message */}
        {isLoading && marketData.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading market data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          // Cryptocurrency List
          <FlatList
            scrollEnabled={false}
            data={filteredMarketData.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CryptoListItem item={item} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cryptocurrencies found</Text>
              </View>
            }
          />
        )}

        {/* Web3 Information Section */}
        {isWeb3Enabled && (
          <View style={styles.web3Section}>
            <Text style={styles.web3SectionTitle}>Blockchain Features</Text>

            <View style={styles.web3Card}>
              <FontAwesome5
                name="ethereum"
                size={24}
                color="#627EEA"
                style={styles.web3Icon}
              />
              <View style={styles.web3CardContent}>
                <Text style={styles.web3CardTitle}>Ethereum Network</Text>
                <Text style={styles.web3CardSubtitle}>
                  {ethereumProvider ? "Connected" : "Not connected"}
                </Text>
              </View>
            </View>

            {connectedAddress ? (
              <View style={styles.walletCard}>
                <FontAwesome5
                  name="wallet"
                  size={24}
                  color="#4cd964"
                  style={styles.web3Icon}
                />
                <View style={styles.web3CardContent}>
                  <Text style={styles.web3CardTitle}>Wallet Connected</Text>
                  <Text style={styles.web3CardSubtitle}>
                    {`${connectedAddress.substring(
                      0,
                      6
                    )}...${connectedAddress.substring(38)}`}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.connectWalletCard}
                onPress={connectWallet}>
                <FontAwesome5
                  name="wallet"
                  size={24}
                  color="#fff"
                  style={styles.web3Icon}
                />
                <Text style={styles.connectWalletText}>Connect Wallet</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  connectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  connectedButton: {
    backgroundColor: "#143618",
  },
  disconnectedButton: {
    backgroundColor: "#333",
  },
  connectButtonText: {
    color: "white",
    fontSize: 14,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4cd964",
    marginLeft: 6,
  },
  balanceSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: "white",
    fontSize: 16,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  balanceAmount: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    padding: 5,
  },
  currencyText: {
    color: "white",
    fontSize: 18,
    marginRight: 5,
  },
  marketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  marketHeaderTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: 150,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    color: "white",
    fontSize: 14,
    width: 100,
    padding: 0,
  },
  columnHeaders: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  columnHeaderText: {
    color: "#888",
    fontSize: 14,
    flex: 1,
  },
  rightAligned: {
    textAlign: "right",
  },
  cryptoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    position: "relative",
  },
  cryptoItemBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cryptoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoSymbol: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  blockchainLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "normal",
  },
  cryptoName: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  percentageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  percentageUp: {
    backgroundColor: "#1b5e20",
  },
  percentageDown: {
    backgroundColor: "#5d0a18",
  },
  percentageText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 10,
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "white",
  },
  web3Section: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  web3SectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  web3Card: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  web3Icon: {
    marginRight: 12,
  },
  web3CardContent: {
    flex: 1,
  },
  web3CardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  web3CardSubtitle: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
  },
  walletCard: {
    backgroundColor: "#143618",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  connectWalletCard: {
    backgroundColor: "#1a4ebc",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  connectWalletText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CryptoMarketScreen;
