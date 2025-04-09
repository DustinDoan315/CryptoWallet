export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export type State = {
  marketData: CryptoCurrency[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  lastUpdated: number | null;
  connectionStatus: "connected" | "disconnected" | "connecting";
};

export type Action =
  | { type: "FETCH_START"; payload?: { isRefreshing?: boolean } }
  | { type: "FETCH_SUCCESS"; payload: { data: CryptoCurrency[] } }
  | { type: "FETCH_ERROR"; payload: { error: string } }
  | { type: "SET_SEARCH_QUERY"; payload: { query: string } }
  | {
      type: "UPDATE_PRICE";
      payload: { id: string; price: number; priceChangePercentage24h: number };
    }
  | {
      type: "SET_CONNECTION_STATUS";
      payload: { status: "connected" | "disconnected" | "connecting" };
    };
