import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import React, { useCallback } from "react";
import { Colors } from "@/constants/Colors";
import HeaderChain from "@/components/HeaderChain";
import Balance from "@/components/Balance";
import CollectionToken from "@/components/CollectionToken";
import CryptoWalletScreen from "@/components/CryptoWallet";

const HomeScreen = () => {
  // Memoize the render content to prevent unnecessary re-renders
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always">
        {renderContent()}
      </ScrollView>
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
    paddingBottom: 20, // Add some padding at the bottom for better scrolling experience
  },
});
