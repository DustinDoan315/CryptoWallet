type ConnectionStatus = "connected" | "disconnected" | "connecting";

interface WebSocketServiceOptions {
  onMessage: (data: {
    id: string;
    price: number;
    priceChangePercentage24h: number;
  }) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

const WEBSOCKET_URL = "wss://stream.binance.com:9443/ws";
const RECONNECT_DELAY = 30 * 1000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 15 * 1000; // 15 seconds
const PING_INTERVAL = 10 * 1000; // 10 seconds
const MAX_RETRIES = 3;

export const createCryptoWebSocketService = (
  options: WebSocketServiceOptions
) => {
  let webSocket: WebSocket | null = null;
  let retryCount = 0;
  let subscribedSymbols: string[] = [];
  let healthCheckTimer: number | null = null;
  let pingTimer: number | null = null;
  let lastMessageTime = 0;

  const cleanup = () => {
    if (webSocket) {
      webSocket.close();
      webSocket = null;
    }
    stopHealthChecks();
  };

  const stopHealthChecks = () => {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
      healthCheckTimer = null;
    }
  };

  const startHealthChecks = () => {
    stopHealthChecks();

    pingTimer = setInterval(() => {
      if (webSocket?.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify({ ping: Date.now() }));
      }
    }, PING_INTERVAL);

    healthCheckTimer = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastMessageTime;
      if (timeSinceLastMessage > HEALTH_CHECK_INTERVAL) {
        console.warn("No messages received recently, reconnecting...");
        disconnect();
        handleReconnect();
      }
    }, HEALTH_CHECK_INTERVAL);
  };

  const subscribeToSymbols = () => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      const subscribeMsg = {
        method: "SUBSCRIBE",
        params: subscribedSymbols.map((symbol) => `${symbol}@ticker`),
        id: 1,
      };
      webSocket.send(JSON.stringify(subscribeMsg));
    }
  };

  const getCryptoIdFromSymbol = (symbol: string): string => {
    return symbol.toLowerCase().replace("usdt", "");
  };

  const handleReconnect = () => {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const backoffTime = Math.min(
        Math.pow(2, retryCount) * 1000,
        30 * 1000 // Max 30 seconds
      );
      setTimeout(() => connect(subscribedSymbols), backoffTime);
    } else {
      setTimeout(() => {
        retryCount = 0;
        connect(subscribedSymbols);
      }, RECONNECT_DELAY);
    }
  };

  const connect = (symbols: string[]) => {
    if (webSocket) {
      disconnect();
    }

    subscribedSymbols = symbols;
    retryCount = 0;
    options.onStatusChange("connecting");

    try {
      webSocket = new WebSocket(WEBSOCKET_URL);

      webSocket.onopen = () => {
        retryCount = 0;
        lastMessageTime = Date.now();
        options.onStatusChange("connected");
        subscribeToSymbols();
        startHealthChecks();
      };

      webSocket.onmessage = (event) => {
        try {
          lastMessageTime = Date.now();
          const data = JSON.parse(event.data);

          if (data.pong) return;

          if (data.e === "ticker") {
            options.onMessage({
              id: getCryptoIdFromSymbol(data.s),
              price: parseFloat(data.c),
              priceChangePercentage24h: parseFloat(data.P),
            });
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      webSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        cleanup();
        options.onStatusChange("disconnected");
      };

      webSocket.onclose = () => {
        cleanup();
        options.onStatusChange("disconnected");
        handleReconnect();
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      cleanup();
      options.onStatusChange("disconnected");
      handleReconnect();
    }
  };

  const disconnect = () => {
    cleanup();
  };

  return {
    connect,
    disconnect,
  };
};
