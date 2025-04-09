import React, {
  useEffect,
  useReducer,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles";
import CryptoListItem from "./components/CryptoListItem";
import type { Action, CryptoCurrency, State } from "./types";
import BalanceSection from "./components/BalanceSection";

// Cache and configuration constants
const MARKET_DATA_CACHE_KEY = "@crypto_market_data";
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;
const REFRESH_INTERVAL = 30 * 1000;
const WEBSOCKET_RECONNECT_DELAY = 30 * 1000;
const MAX_RETRIES = 3;

// API endpoints
const COINGECKO_API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1";
const WEBSOCKET_URL = "wss://stream.binance.com:9443/ws";

// Initial state
const initialState: State = {
  marketData: [],
  isLoading: true,
  isRefreshing: false,
  error: null,
  searchQuery: "",
  lastUpdated: null,
  connectionStatus: "disconnected",
};

// Reducer function for state management
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        isLoading:
          !action.payload?.isRefreshing && state.marketData.length === 0,
        isRefreshing: !!action.payload?.isRefreshing,
        error: null,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        marketData: action.payload.data,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdated: Date.now(),
      };
    case "FETCH_ERROR":
      return {
        ...state,
        isLoading: false,
        isRefreshing: false,
        error: action.payload.error,
      };
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload.query,
      };
    case "UPDATE_PRICE":
      return {
        ...state,
        marketData: state.marketData.map((crypto) =>
          crypto.id === action.payload.id
            ? {
                ...crypto,
                current_price: action.payload.price,
                price_change_percentage_24h:
                  action.payload.priceChangePercentage24h,
              }
            : crypto
        ),
      };
    case "SET_CONNECTION_STATUS":
      return {
        ...state,
        connectionStatus: action.payload.status,
      };
    default:
      return state;
  }
}

// Utility functions for cache management
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
        return data as CryptoCurrency[];
      }
    }
    return null;
  } catch (error) {
    console.error("Error loading from cache:", error);
    return null;
  }
};

const CryptoMarketScreen: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    marketData,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    connectionStatus,
  } = state;

  // Refs for managing resources
  const webSocketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef<number>(0);
  const refreshIntervalRef: any = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Symbol mapping for WebSocket (maps CoinGecko IDs to Binance symbols)
  const symbolMapRef = useRef<Record<string, string>>({
    bitcoin: "btcusdt",
    ethereum: "ethusdt",
    binancecoin: "bnbusdt",
    ripple: "xrpusdt",
    cardano: "adausdt",
    solana: "solusdt",
    polkadot: "dotusdt",
    dogecoin: "dogeusdt",
  });

  const fetchMarketData = useCallback(async (forceRefresh = false) => {
    dispatch({ type: "FETCH_START", payload: { isRefreshing: forceRefresh } });

    try {
      if (!forceRefresh) {
        const cachedData = await loadFromCache();
        if (cachedData) {
          dispatch({ type: "FETCH_SUCCESS", payload: { data: cachedData } });
          return;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(COINGECKO_API_URL, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      const transformedData = data.map((item: any) => ({
        ...item,
      }));

      dispatch({ type: "FETCH_SUCCESS", payload: { data: transformedData } });
      retryCountRef.current = 0;
      await saveToCache(transformedData);
      connectToWebSocket(transformedData);
    } catch (error: any) {
      console.error("Error fetching market data:", error);

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.log(
          `Retrying fetch (${retryCountRef.current}/${MAX_RETRIES})...`
        );

        const backoffTime = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(() => fetchMarketData(forceRefresh), backoffTime);
      } else {
        const errorMessage =
          error.message || "Failed to load market data. Pull down to retry.";
        dispatch({ type: "FETCH_ERROR", payload: { error: errorMessage } });

        const cachedData = await loadFromCache(true);
        if (cachedData) {
          dispatch({ type: "FETCH_SUCCESS", payload: { data: cachedData } });
        }
      }
    }
  }, []);

  // Handle WebSocket connection for real-time price updates
  const connectToWebSocket = useCallback((cryptos: CryptoCurrency[]) => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    try {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: { status: "connecting" },
      });

      const symbols = cryptos
        .map((crypto) => symbolMapRef.current[crypto.id])
        .filter(Boolean);

      if (symbols.length === 0) {
        console.log("No valid symbols to connect to WebSocket");
        return;
      }

      // Create new WebSocket connection
      webSocketRef.current = new WebSocket(WEBSOCKET_URL);

      webSocketRef.current.onopen = () => {
        console.log("WebSocket connected");
        dispatch({
          type: "SET_CONNECTION_STATUS",
          payload: { status: "connected" },
        });

        // Subscribe to ticker streams for all valid symbols
        const subscribeMsg = {
          method: "SUBSCRIBE",
          params: symbols.map((symbol) => `${symbol}@ticker`),
          id: 1,
        };

        if (
          webSocketRef.current &&
          webSocketRef.current.readyState === WebSocket.OPEN
        ) {
          webSocketRef.current.send(JSON.stringify(subscribeMsg));
        }
      };

      webSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle ticker data update
          if (data.e === "ticker") {
            const symbol = data.s.toLowerCase();
            const price = parseFloat(data.c);
            const priceChangePercent = parseFloat(data.P);

            // Find corresponding crypto by symbol
            const cryptoId = Object.entries(symbolMapRef.current).find(
              ([_, val]) => val === symbol
            )?.[0];

            if (cryptoId) {
              dispatch({
                type: "UPDATE_PRICE",
                payload: {
                  id: cryptoId,
                  price,
                  priceChangePercentage24h: priceChangePercent,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        dispatch({
          type: "SET_CONNECTION_STATUS",
          payload: { status: "disconnected" },
        });
      };

      webSocketRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        dispatch({
          type: "SET_CONNECTION_STATUS",
          payload: { status: "disconnected" },
        });

        // Reconnect after delay
        setTimeout(() => {
          if (appStateRef.current === "active") {
            connectToWebSocket(cryptos);
          }
        }, WEBSOCKET_RECONNECT_DELAY);
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: { status: "disconnected" },
      });
    }
  }, []);

  // Handle app state changes for proper resource management
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        if (webSocketRef.current) {
          console.log("Closing WebSocket connection due to app state change");
          webSocketRef.current.close();
          webSocketRef.current = null;
        }

        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App is coming to foreground
        fetchMarketData();

        refreshIntervalRef.current = setInterval(() => {
          fetchMarketData();
        }, REFRESH_INTERVAL);
      }

      appStateRef.current = nextAppState;
    },
    [fetchMarketData]
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    fetchMarketData(true);
  }, [fetchMarketData]);

  // Filter market data based on search query
  const filteredMarketData = useMemo(() => {
    if (!searchQuery) return marketData;

    return marketData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [marketData, searchQuery]);

  useEffect(() => {
    fetchMarketData();

    refreshIntervalRef.current = setInterval(() => {
      fetchMarketData();
    }, REFRESH_INTERVAL);

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      if (webSocketRef.current) {
        webSocketRef.current.close();
      }

      appStateSubscription.remove();
    };
  }, [fetchMarketData, handleAppStateChange]);

  const renderItem = useCallback(
    ({ item }: { item: CryptoCurrency }) => <CryptoListItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: CryptoCurrency) => item.id, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View>
        <View style={styles.columnHeaders}>
          <Text style={styles.columnHeaderText}>Tên</Text>
          <Text style={[styles.columnHeaderText, styles.rightAligned]}>
            Thay đổi
          </Text>
        </View>
      </View>
    ),
    []
  );

  // Empty list component
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isLoading
            ? "Loading cryptocurrencies..."
            : "No cryptocurrencies found"}
        </Text>
      </View>
    ),
    [isLoading]
  );

  // Connection status indicator
  const ConnectionStatusIndicator = useMemo(
    () => (
      <View
        style={[
          styles.connectionIndicator,
          {
            backgroundColor:
              connectionStatus === "connected"
                ? "#27ae60"
                : connectionStatus === "connecting"
                ? "#f39c12"
                : "#e74c3c",
          },
        ]}>
        <Text style={styles.connectionText}>
          {connectionStatus === "connected"
            ? "Live"
            : connectionStatus === "connecting"
            ? "Connecting..."
            : "Offline"}
        </Text>
      </View>
    ),
    [connectionStatus]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="grid" size={24} color="white" />
          <Text style={styles.headerTitle}>Giao dịch mô phỏng</Text>
        </View>
        {ConnectionStatusIndicator}
      </View>

      {/* Balance Section */}
      <BalanceSection />

      {/* Market Data Section */}
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
            onChangeText={(text) =>
              dispatch({ type: "SET_SEARCH_QUERY", payload: { query: text } })
            }
          />
        </View>
      </View>

      {/* Loading Indicator */}
      {isLoading && marketData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      ) : error && marketData.length === 0 ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMarketData.slice(0, 7)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={["#3498db"]}
            />
          }
          // Performance optimizations
          removeClippedSubviews={Platform.OS === "android"}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

export default React.memo(CryptoMarketScreen);
