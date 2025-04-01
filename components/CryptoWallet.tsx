import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
  TouchableHighlight,
} from "react-native";
import {
  Ionicons,
  Feather,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";

export default function CryptoWalletScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");

  // Mock data for assets
  const [assets, setAssets] = useState([
    {
      id: "eur",
      name: "EUR",
      symbol: "€",
      color: "#FF4C38",
      balance: 53249.93,
      frozen: 0,
    },
    {
      id: "usdt",
      name: "USDT",
      symbol: "₮",
      color: "#26A17B",
      balance: 22.07,
      frozen: 0,
    },
    {
      id: "usdc",
      name: "USDC",
      symbol: "$",
      color: "#2775CA",
      balance: 0.19,
      frozen: 0,
    },
    {
      id: "btc",
      name: "BTC",
      symbol: "₿",
      color: "#F7931A",
      balance: 0,
      frozen: 0,
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate loading data
    setTimeout(() => {
      // Update asset values with slight variations to simulate real data
      setAssets(
        assets.map((asset) => ({
          ...asset,
          balance:
            asset.balance + (Math.random() * 2 - 1) * 0.05 * asset.balance,
        }))
      );
      setRefreshing(false);
    }, 1500);
  }, [assets]);

  const handleReset = () => {
    Alert.alert(
      "Xác nhận đặt lại",
      "Bạn có chắc chắn muốn đặt lại danh mục đầu tư của mình không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đặt lại",
          onPress: () => {
            // Reset the portfolio
            setAssets(
              assets.map((asset) => ({
                ...asset,
                balance: asset.id === "eur" ? 100000 : 0,
                frozen: 0,
              }))
            );
            Alert.alert(
              "Thành công",
              "Danh mục đầu tư của bạn đã được đặt lại"
            );
          },
        },
      ]
    );
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  const handleCurrencySelect = () => {
    Alert.alert("Chọn đơn vị tiền tệ", "Chọn đơn vị tiền tệ hiển thị", [
      { text: "USDT", onPress: () => setSelectedCurrency("USDT") },
      { text: "EUR", onPress: () => setSelectedCurrency("EUR") },
      { text: "USD", onPress: () => setSelectedCurrency("USD") },
      { text: "BTC", onPress: () => setSelectedCurrency("BTC") },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  // Calculate total balance
  const totalBalance = assets.reduce(
    (total, asset) => total + asset.balance,
    0
  );

  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => Alert.alert("Menu", "Menu đã được mở")}
            style={styles.iconButton}>
            <Ionicons name="grid" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giao dịch mô phỏng</Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            Alert.alert(
              "Thoát",
              "Bạn đã chọn thoát khỏi chế độ giao dịch mô phỏng"
            )
          }>
          <Text style={styles.headerButtonText}>Thoát</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Tổng giá trị ước tính</Text>
            <TouchableOpacity onPress={toggleBalanceVisibility}>
              <Ionicons
                name={isBalanceHidden ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceAmountRow}>
            <Text style={styles.balanceAmount}>
              {isBalanceHidden ? "******" : formatNumber(totalBalance)}
            </Text>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={handleCurrencySelect}>
              <Text style={styles.currencyText}>{selectedCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReset}
            activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>Đặt lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert("Lịch sử", "Xem lịch sử giao dịch của bạn")
            }
            activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>

        {/* Tools */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            onPress={() => Alert.alert("Bộ lọc", "Mở bộ lọc danh sách tài sản")}
            style={styles.iconButton}>
            <Feather name="sliders" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert("Tìm kiếm", "Tìm kiếm tài sản")}
            style={styles.iconButton}>
            <Feather name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Asset List */}
        <View style={styles.assetList}>
          {assets.map((asset) => (
            <TouchableHighlight
              key={asset.id}
              onPress={() =>
                Alert.alert(
                  `Chi tiết ${asset.name}`,
                  `Xem chi tiết tài sản ${asset.name}`
                )
              }
              underlayColor="#1C1C1E"
              style={styles.assetItemTouchable}>
              <View style={styles.assetItem}>
                <View style={styles.assetItemLeft}>
                  <View
                    style={[
                      styles.assetIcon,
                      { backgroundColor: asset.color },
                    ]}>
                    <Text style={styles.assetIconText}>{asset.symbol}</Text>
                  </View>
                  <Text style={styles.assetName}>{asset.name}</Text>
                </View>
                <View style={styles.assetDetailsContainer}>
                  <View style={styles.assetDetails}>
                    <Text style={styles.assetDetailLabel}>Vốn chủ sở hữu</Text>
                    <Text style={styles.assetDetailValue}>
                      ¥{formatNumber(asset.balance)}
                    </Text>
                  </View>
                  <View style={styles.assetDetails}>
                    <Text style={styles.assetDetailLabel}>Bị đóng băng</Text>
                    <Text style={styles.assetDetailValue}>
                      ¥{formatNumber(asset.frozen)}
                    </Text>
                  </View>
                  <View style={styles.assetDetails}>
                    <Text style={styles.assetDetailLabel}>Khả dụng</Text>
                    <Text style={styles.assetDetailValue}>
                      ¥{formatNumber(asset.balance - asset.frozen)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableHighlight>
          ))}

          {/* Add more assets button */}
          <TouchableOpacity
            style={styles.addAssetButton}
            onPress={() =>
              Alert.alert(
                "Thêm tài sản",
                "Thêm tài sản mới vào danh mục của bạn"
              )
            }>
            <Ionicons name="add-circle-outline" size={24} color="#666" />
            <Text style={styles.addAssetText}>Thêm tài sản mới</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
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
  headerButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerButtonText: {
    color: "white",
    fontSize: 14,
  },
  balanceSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    color: "white",
    fontSize: 15,
  },
  balanceAmountRow: {
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
  actionButtons: {
    flexDirection: "row",
    marginTop: 25,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 25,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
  },
  toolsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 25,
  },
  assetList: {
    marginTop: 15,
  },
  assetItemTouchable: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  assetItem: {
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  assetItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  assetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  assetIconText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  assetName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  assetDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assetDetails: {
    flex: 1,
  },
  assetDetailLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
  assetDetailValue: {
    color: "white",
    fontSize: 14,
  },
  iconButton: {
    padding: 8,
  },
  addAssetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  addAssetText: {
    color: "#666",
    fontSize: 16,
    marginLeft: 10,
  },
});
