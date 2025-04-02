import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  RefreshControl,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define types for cryptocurrency data
interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

// Cache constants
const MARKET_DATA_CACHE_KEY = "@crypto_market_data";
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;
const REFRESH_INTERVAL = 3 * 1000;

const CryptoMarketScreen: React.FC = () => {
  const [marketData, setMarketData] = useState<CryptoCurrency[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(53145.76);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for managing polling and WebSocket connections
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef<number>(0);
  const MAX_RETRIES = 3;

  const fetchMarketData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      if (!forceRefresh) {
        setIsLoading(true);
      } else {
        setRefreshing(true);
      }

      if (!forceRefresh) {
        const cachedData = await loadFromCache();
        if (cachedData) {
          setMarketData(cachedData);
          setIsLoading(false);
          return;
        }
      }

      // Fetch fresh data from API
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          // Timeout is handled using AbortController
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Update state with new data
      setMarketData(data);
      retryCountRef.current = 0; // Reset retry count on success

      // Cache the data
      await saveToCache(data);
    } catch (error) {
      console.error("Error fetching market data:", error);

      // Implement retry logic
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.log(
          `Retrying fetch (${retryCountRef.current}/${MAX_RETRIES})...`
        );

        // Exponential backoff for retries
        const backoffTime = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(() => fetchMarketData(forceRefresh), backoffTime);
      } else {
        setError("Failed to load market data. Pull down to retry.");
        // If cache exists, load stale data as fallback
        const cachedData = await loadFromCache(true);
        if (cachedData) {
          setMarketData(cachedData);
        }
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  const setupWebSocket = useCallback(() => {
    console.log("Setting up WebSocket connection...");

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, []);

  // Manual refresh handler
  const onRefresh = useCallback(() => {
    fetchMarketData(true);
  }, [fetchMarketData]);

  // Toggle balance visibility
  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  // Handle exit
  const handleExit = () => {
    router.back();
  };

  // Set up data fetching and polling
  useEffect(() => {
    // Initial load
    fetchMarketData();

    // Setup regular polling
    refreshIntervalRef.current = setInterval(() => {
      fetchMarketData();
    }, REFRESH_INTERVAL);

    // Setup WebSocket connection
    const cleanupWebSocket = setupWebSocket();

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      cleanupWebSocket();
    };
  }, [fetchMarketData, setupWebSocket]);

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

    return (
      <TouchableOpacity
        style={styles.cryptoItem}
        onPress={() => {
          // Navigate to detail screen (implementation would be in a real app)
          console.log(`Navigate to ${item.id} detail`);

          router.push(`/(subs)/crypto-detail?id=${item.id}`);
        }}>
        <View style={styles.cryptoIconContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.cryptoIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.cryptoInfo}>
          <Text style={styles.cryptoSymbol}>{item.symbol.toUpperCase()}</Text>
          <Text style={styles.cryptoName}>{item.name}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
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
          <Text style={styles.headerTitle}>Giao dịch mô phỏng</Text>
        </View>
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
          <Text style={styles.marketHeaderTitle}>Hàng đầu</Text>
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={18}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Column Headers */}
        <View style={styles.columnHeaders}>
          <Text style={styles.columnHeaderText}>Tên</Text>
          <Text style={[styles.columnHeaderText, styles.rightAligned]}>
            Giá gần nhất
          </Text>
          <Text style={[styles.columnHeaderText, styles.rightAligned]}>
            Thay đổi
          </Text>
        </View>

        {/* Loading Indicator or Error Message */}
        {isLoading && marketData.length === 0 ? (
          <View
            style={{
              padding: 16,
              alignItems: "center",
            }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text
              style={{
                color: "white",
                marginTop: 10,
              }}>
              Loading market data...
            </Text>
          </View>
        ) : error ? (
          <View style={{ padding: 16, alignItems: "center" }}>
            <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
            <Text style={{}}>{error}</Text>
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
              <View
                style={{
                  padding: 16,
                  alignItems: "center",
                }}>
                <Text
                  style={{
                    color: "white",
                  }}>
                  No cryptocurrencies found
                </Text>
              </View>
            }
          />
        )}
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
  exitButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  exitButtonText: {
    color: "white",
    fontSize: 14,
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
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingBottom: Platform.OS === "ios" ? 25 : 15,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: "#3498db",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
});

export default CryptoMarketScreen;
