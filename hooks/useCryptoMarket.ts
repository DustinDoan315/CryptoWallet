import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  CryptoMarketService,
  type CryptoCurrency,
} from "../services/CryptoMarketService";
import { createCryptoWebSocketService } from "../services/CryptoWebSocketService";
import { AppState, type AppStateStatus } from "react-native";

type ConnectionStatus = "connected" | "disconnected" | "connecting";

interface UseCryptoMarketOptions {
  symbolMap: Record<string, string>;
  refreshInterval?: number;
}

export function useCryptoMarket({
  symbolMap,
  refreshInterval = 60 * 1000, // 60 seconds
}: UseCryptoMarketOptions) {
  const [marketData, setMarketData] = useState<CryptoCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const webSocketServiceRef = useRef<ReturnType<
    typeof createCryptoWebSocketService
  > | null>(null);
  const refreshIntervalRef = useRef<any>(null);
  const appStateRef = useRef(AppState.currentState);
  const webSocketReconnectAttemptRef = useRef(0);

  // Debounce fetch requests to prevent rapid successive calls
  const debounceTimeoutRef = useRef<any>(null);

  const fetchMarketData = useCallback(
    async (forceRefresh = false) => {
      // Cancel any pending debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      // If not force refresh, check if we have recent data
      if (!forceRefresh && marketData.length > 0) {
        const lastUpdated = marketData[0]?.last_updated;
        if (lastUpdated && Date.now() - lastUpdated < 60000) {
          // 1 minute
          setIsLoading(false);
          return;
        }
      }

      // Debounce non-force requests by 500ms
      if (!forceRefresh) {
        debounceTimeoutRef.current = setTimeout(async () => {
          try {
            await doFetchMarketData(forceRefresh);
          } catch {
            setIsLoading(false);
          }
        }, 500);
        return;
      }

      // Force refresh goes immediately
      try {
        await doFetchMarketData(forceRefresh);
      } catch {
        setIsLoading(false);
      }
    },
    [marketData.length, symbolMap]
  );

  const doFetchMarketData = useCallback(
    async (forceRefresh: boolean) => {
      try {
        const shouldShowLoading = !forceRefresh && marketData.length === 0;
        setIsLoading(shouldShowLoading);
        setIsRefreshing(forceRefresh);
        setError(null);

        // Batch API requests and cache handling with rate limit awareness
        const data = await CryptoMarketService.fetchMarketData(forceRefresh);

        // Optimized state update
        setMarketData((prev) => {
          const newData = data.map((newItem) => {
            const existing = prev.find((item) => item.id === newItem.id);
            return existing ? { ...existing, ...newItem } : newItem;
          });
          return newData;
        });

        if (data.length === 0) {
          console.warn("No market data received");
        }
        setIsLoading(false);
        setIsRefreshing(false);

        // Connect WebSocket if we have data
        if (data.length > 0) {
          // Optimized WebSocket connection
          const symbols = data
            .slice(0, 10) // Only connect top 10 to reduce load
            .map((crypto) => symbolMap[crypto.id])
            .filter(Boolean);

          if (symbols.length > 0) {
            if (!webSocketServiceRef.current) {
              webSocketServiceRef.current = createCryptoWebSocketService({
                onMessage: ({
                  id,
                  price,
                  priceChangePercentage24h,
                }: {
                  id: string;
                  price: number;
                  priceChangePercentage24h: number;
                }) => {
                  setMarketData((prev) =>
                    prev.map((crypto) =>
                      crypto.id === id
                        ? {
                            ...crypto,
                            current_price: price,
                            price_change_percentage_24h:
                              priceChangePercentage24h,
                            last_updated: Date.now(), // Track update time
                          }
                        : crypto
                    )
                  );
                },
                onStatusChange: (status: ConnectionStatus) => {
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
        } else if (webSocketServiceRef.current) {
          // Disconnect WebSocket if no data
          webSocketServiceRef.current.disconnect();
          setConnectionStatus("disconnected");
        }
      } catch (err) {
        console.warn("Error fetching market data:", err);
        setMarketData([]); // Clear market data on error
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [marketData.length, symbolMap]
  );

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
      try {
        await fetchMarketData();
      } catch {
        if (isMounted) {
          setIsLoading(false);
        }
      }

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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
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
