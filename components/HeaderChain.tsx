import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const HeaderChain = () => {
  const handleQr = () => {
    console.log("QR code pressed");
  };

  return (
    <View style={styles.container}>
      {/* Avatar & QR Code */}
      <View style={styles.avatarContainer}>
        <Image
          source={require("../assets/icons/avatar_2.png")}
          resizeMode="cover"
          style={styles.avatar}
        />
        <Pressable
          onPress={() => {
            router.push("/add-account");
          }}
          style={styles.qrButton}>
          <Image
            source={require("../assets/icons/qr_code.png")}
            resizeMode="cover"
            style={styles.qrIcon}
          />
        </Pressable>
      </View>

      {/* Network Selector */}
      <View style={styles.networkContainer}>
        <Text style={styles.networkText}>Ethereum Main</Text>
        <Pressable
          onPress={() => {
            router.push("/add-token");
          }}>
          <Image
            source={require("../assets/icons/down_arrow.png")}
            style={styles.downArrow}
            resizeMode="cover"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default memo(HeaderChain);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    paddingVertical: 24,
  },
  avatarContainer: {
    position: "absolute",
    left: 0,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  qrButton: {
    position: "absolute",
    right: -10,
    bottom: -5,
    backgroundColor: Colors.dark_light_1,
    borderRadius: 10,
    padding: 4,
  },
  qrIcon: {
    width: 18,
    height: 18,
  },
  networkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  networkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  downArrow: {
    width: 20,
    height: 20,
    marginLeft: 6,
  },
});
