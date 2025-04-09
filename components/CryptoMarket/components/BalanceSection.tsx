import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { styles } from "../styles";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/utils/formatters";
type BalanceSectionProps = {};
const BalanceSection = ({}: BalanceSectionProps) => {
  const [totalBalance, setTotalBalance] = useState<number>(53145.76);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");

  // Toggle balance visibility
  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  return (
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
          {isBalanceHidden ? "••••••••" : formatCurrency(totalBalance, "", 2)}
        </Text>
        <TouchableOpacity style={styles.currencySelector}>
          <Text style={styles.currencyText}>{selectedCurrency}</Text>
          <Ionicons name="chevron-down" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BalanceSection;
