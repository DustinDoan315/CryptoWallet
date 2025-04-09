import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { styles } from "../styles";
import { router } from "expo-router";
import { CryptoCurrency } from "../types";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

const CryptoListItem = ({ item }: { item: CryptoCurrency }) => {
  const isPriceDown = item.price_change_percentage_24h < 0;

  return (
    <TouchableOpacity
      style={styles.cryptoItem}
      onPress={() => {
        console.log(`Navigate to ${item.id} detail`);

        router.push(`/(subs)/crypto-detail?id=${item.id}`);
      }}>
      <View style={styles.cryptoIconContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.cryptoIcon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.cryptoInfo}>
        <Text style={styles.cryptoSymbol}>{item.symbol.toUpperCase()}</Text>
        <Text style={styles.cryptoName}>{item.name}</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>
          {formatCurrency(item.current_price)}
        </Text>
        <View
          style={[
            styles.percentageContainer,
            isPriceDown ? styles.percentageDown : styles.percentageUp,
          ]}>
          <Text style={styles.percentageText}>
            {formatPercentage(item.price_change_percentage_24h)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CryptoListItem;
