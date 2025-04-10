import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    fontSize: 14,
    opacity: 0.8,
  },

  errorContainer: {
    padding: 24,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  errorHelpText: {
    color: "#3498db",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 18,
    textDecorationLine: "underline",
  },

  connectionIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  connectionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
