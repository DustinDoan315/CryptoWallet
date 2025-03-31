import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { WebView } from "react-native-webview";
import HeaderChain from "@/components/HeaderChain";
import { Colors } from "@/constants/Colors";
import Balance from "@/components/Balance";
import CollectionToken from "@/components/CollectionToken";

const HomeScreen = () => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"1m" | "3m" | "5m">("1m");
  const [wsConnected, setWsConnected] = useState(false);

  return (
    <View style={styles.container}>
      <HeaderChain />
      <Balance />
      <CollectionToken />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  webview: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.dark_light_1 },
  status: { textAlign: "center", color: "blue" },
  error: { textAlign: "center", color: "red" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
});
