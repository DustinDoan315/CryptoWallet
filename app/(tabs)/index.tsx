import { StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";
import React, { useCallback } from "react";
import { Colors } from "@/constants/Colors";
import CryptoWalletScreen from "@/components/CryptoWallet";

const HomeScreen = () => {
  const renderContent = useCallback(() => {
    return (
      <>
        {/* <HeaderChain />
        <Balance />
        <CollectionToken /> */}
        <CryptoWalletScreen />
      </>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark_light_1}
      />

      {renderContent()}
    </SafeAreaView>
  );
};

export default React.memo(HomeScreen);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark_light_1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.dark_light_1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
