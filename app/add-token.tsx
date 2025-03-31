import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";

const AddToken = () => {
  const [activityItems, setActivityItems] = useState([
    { id: 1, color: "#3e8dff", title: "Ethereum Main", isActive: true },
    { id: 2, color: "#75e268", title: "Goerli Test", isActive: false },
    { id: 3, color: "#ef5350", title: "Ropsten Test", isActive: false },
    { id: 4, color: "#ffca28", title: "Kovan Test", isActive: false },
  ]);

  // Handle selecting a network
  const handleSelectNetwork = useCallback((id: number) => {
    setActivityItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        isActive: item.id === id,
      }))
    );
  }, []);

  // Handle close modal
  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const activeItem = activityItems.find((item) => item.isActive);
  const inactiveItems = activityItems.filter((item) => !item.isActive);

  return (
    <TouchableWithoutFeedback onPress={handleClose}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContainer}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Network</Text>
              </View>

              {/* Render Active Item First */}
              {activeItem && (
                <Pressable
                  key={activeItem.id}
                  style={[styles.itemContainer, styles.activeItemContainer]}
                  onPress={() => handleSelectNetwork(activeItem.id)}>
                  <View
                    style={[
                      styles.networkDot,
                      { backgroundColor: activeItem.color },
                    ]}
                  />
                  <Text style={styles.itemTitle}>{activeItem.title}</Text>
                  <View style={styles.checkmarkContainer}>
                    <Image
                      source={require("../assets/images/success.png")}
                      style={styles.itemIcon}
                    />
                  </View>
                </Pressable>
              )}

              {/* "Other Network" Text */}
              {inactiveItems.length > 0 && (
                <Text style={styles.otherNetworkText}>Other Network</Text>
              )}

              {/* Render Inactive Items Below */}
              {inactiveItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.itemContainer}
                  onPress={() => handleSelectNetwork(item.id)}>
                  <View
                    style={[styles.networkDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </Pressable>
              ))}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.8}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  handleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  container: {
    padding: 20,
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.background,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  activeItemContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  networkDot: {
    width: 16,
    height: 16,
    borderRadius: 16,
  },
  itemTitle: {
    fontSize: 16,
    color: Colors.light.background,
    marginLeft: 12,
    flex: 1,
  },
  checkmarkContainer: {
    width: 24,
  },
  itemIcon: {
    width: 24,
    height: 24,
  },
  otherNetworkText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 4,
    opacity: 0.8,
  },
  closeButton: {
    marginTop: 30,
    marginBottom: 10,
    height: 50,
    justifyContent: "center",
    backgroundColor: "#d9534f",
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddToken;
