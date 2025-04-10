type ConnectionStatus = "connected" | "disconnected" | "connecting";

interface WebSocketServiceOptions {
  onMessage: (data: {
    id: string;
    price: number;
    priceChangePercentage24h: number;
  }) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export class CryptoWebSocketService {
  private static WEBSOCKET_URL = "wss://stream.binance.com:9443/ws";
  private static RECONNECT_DELAY = 30 * 1000; // 30 seconds
  private static HEALTH_CHECK_INTERVAL = 15 * 1000; // 15 seconds
  private static PING_INTERVAL = 10 * 1000; // 10 seconds

  private webSocket: WebSocket | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private subscribedSymbols: string[] = [];
  private options: WebSocketServiceOptions;
  private healthCheckTimer?: NodeJS.Timeout;
  private pingTimer?: NodeJS.Timeout;
  private lastMessageTime = 0;

  constructor(options: WebSocketServiceOptions) {
    this.options = options;
  }

  connect(symbols: string[]) {
    if (this.webSocket) {
      this.disconnect();
    }

    this.subscribedSymbols = symbols;
    this.retryCount = 0;
    this.options.onStatusChange("connecting");

    try {
      this.webSocket = new WebSocket(CryptoWebSocketService.WEBSOCKET_URL);

      this.webSocket.onopen = () => {
        this.retryCount = 0;
        this.lastMessageTime = Date.now();
        this.options.onStatusChange("connected");
        this.subscribeToSymbols();
        this.startHealthChecks();
      };

      this.webSocket.onmessage = (event) => {
        try {
          this.lastMessageTime = Date.now();
          const data = JSON.parse(event.data);
          
          // Handle ping responses
          if (data.pong) {
            return;
          }
          
          if (data.e === "ticker") {
            this.options.onMessage({
              id: this.getCryptoIdFromSymbol(data.s),
              price: parseFloat(data.c),
              priceChangePercentage24h: parseFloat(data.P),
            });
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      this.webSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.cleanup();
        this.options.onStatusChange("disconnected");
      };

      this.webSocket.onclose = () => {
        this.cleanup();
        this.options.onStatusChange("disconnected");
        this.handleReconnect();
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      this.cleanup();
      this.options.onStatusChange("disconnected");
      this.handleReconnect();
    }
  }

  disconnect() {
    this.cleanup();
  }

  private cleanup() {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    this.stopHealthChecks();
  }

  private startHealthChecks() {
    this.stopHealthChecks();
    
    // Send periodic pings
    this.pingTimer = setInterval(() => {
      if (this.webSocket?.readyState === WebSocket.OPEN) {
        this.webSocket.send(JSON.stringify({ ping: Date.now() }));
      }
    }, CryptoWebSocketService.PING_INTERVAL);

    // Check connection health
    this.healthCheckTimer = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      if (timeSinceLastMessage > CryptoWebSocketService.HEALTH_CHECK_INTERVAL) {
        console.warn('No messages received recently, reconnecting...');
        this.disconnect();
        this.handleReconnect();
      }
    }, CryptoWebSocketService.HEALTH_CHECK_INTERVAL);
  }

  private stopHealthChecks() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  private subscribeToSymbols() {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const subscribeMsg = {
        method: "SUBSCRIBE",
        params: this.subscribedSymbols.map((symbol) => `${symbol}@ticker`),
        id: 1,
      };
      this.webSocket.send(JSON.stringify(subscribeMsg));
    }
  }

  private handleReconnect() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const backoffTime = Math.min(
        Math.pow(2, this.retryCount) * 1000,
        30 * 1000 // Max 30 seconds
      );
      setTimeout(() => this.connect(this.subscribedSymbols), backoffTime);
    } else {
      setTimeout(
        () => {
          this.retryCount = 0; // Reset retry count after max retries
          this.connect(this.subscribedSymbols);
        },
        CryptoWebSocketService.RECONNECT_DELAY
      );
    }
  }

  private getCryptoIdFromSymbol(symbol: string): string {
    // This mapping should be provided by the parent component
    // Default to returning the symbol in lowercase
    return symbol.toLowerCase().replace("usdt", "");
  }
}
