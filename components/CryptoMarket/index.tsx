import React from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { styles } from "./styles";
import CryptoListItem from "./components/CryptoListItem";
import BalanceSection from "./components/BalanceSection";
import { useCryptoMarket } from "@/hooks/useCryptoMarket";
import type { CryptoCurrency } from "./types";

const symbolMap = {
  bitcoin: "btcusdt",
  ethereum: "ethusdt", 
  binancecoin: "bnbusdt",
  ripple: "xrpusdt",
  cardano: "adausdt",
  solana: "solusdt",
  polkadot: "dotusdt",
  dogecoin: "dogeusdt",
};

const CryptoMarketScreen: React.FC = () => {
  const {
    marketData,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    connectionStatus,
    refresh,
  } = useCryptoMarket({ symbolMap });

  const filteredMarketData = marketData.slice(0, 7); // Show top 7 cryptos

  const renderItem = ({ item }: { item: CryptoCurrency }) => (
    <CryptoListItem item={item} />
  );

  const keyExtractor = (item: CryptoCurrency) => item.id;

  const ListHeaderComponent = (
    <View>
      <View style={styles.columnHeaders}>
        <Text style={styles.columnHeaderText}>Tên</Text>
        <Text style={[styles.columnHeaderText, styles.rightAligned]}>
          Thay đổi
        </Text>
      </View>
    </View>
  );

  const ListEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {isLoading ? "Loading cryptocurrencies..." : "No cryptocurrencies found"}
      </Text>
    </View>
  );

  const ConnectionStatusIndicator = (
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
      ]}
    >
      <Text style={styles.connectionText}>
        {connectionStatus === "connected"
          ? "Live"
          : connectionStatus === "connecting"
          ? "Connecting..."
          : "Offline"}
      </Text>
    </View>
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
            onChangeText={setSearchQuery}
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
          data={filteredMarketData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor="#fff"
              colors={["#3498db"]}
            />
          }
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
