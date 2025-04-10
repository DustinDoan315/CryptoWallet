export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  market_cap?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  last_updated?: number; // Changed from string to number (timestamp)
}

export interface CryptoMarketData {
  data: CryptoCurrency[];
  lastUpdated: number;
  error?: string;
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

export interface SymbolMapping {
  [key: string]: string; // Maps crypto IDs to trading symbols
}

export interface CryptoListItemProps {
  item: CryptoCurrency;
  onPress?: (id: string) => void;
}

export interface BalanceSectionProps {
  balance?: number;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  onToggleVisibility?: (isHidden: boolean) => void;
}
