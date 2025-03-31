import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";

const AddAccount = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState("New Account");
  const [isImporting, setIsImporting] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [accounts, setAccounts] = useState([
    { id: 1, name: "Account 1", balance: "0.32 ETH", isActive: true },
    { id: 2, name: "Account 2", balance: "1.25 ETH", isActive: false },
    { id: 3, name: "Account 3", balance: "3.78 ETH", isActive: false },
  ]);

  const handleSelectAccount = useCallback((id: number) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) =>
        acc.id === id ? { ...acc, isActive: true } : { ...acc, isActive: false }
      )
    );
  }, []);

  const handleCreateAccount = useCallback(() => {
    if (!newAccountName.trim()) return;

    setAccounts((prevAccounts) => [
      ...prevAccounts,
      {
        id: prevAccounts.length + 1,
        name: newAccountName,
        balance: "0.00 ETH",
        isActive: false,
      },
    ]);
    setIsCreating(false);
    setNewAccountName("New Account");
  }, [newAccountName]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const renderAccountItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        style={styles.accountItem}
        onPress={() => handleSelectAccount(item.id)}>
        <Image
          source={require("../assets/icons/avatar_2.png")}
          style={styles.avatar}
        />
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.balance}>{item.balance}</Text>
        </View>
        {item.isActive && (
          <Image
            source={require("../assets/images/success.png")}
            style={styles.activeIcon}
          />
        )}
      </TouchableOpacity>
    ),
    [handleSelectAccount]
  );

  const handleImportAccount = () => {
    if (!privateKey.trim()) return;
    const newImportedAccount = {
      id: accounts.length + 1,
      name: `Imported Account ${accounts.length + 1}`,
      balance: "0.00 ETH",
      isActive: false,
    };
    setAccounts([...accounts, newImportedAccount]);
    setIsImporting(false);
    setPrivateKey("");
  };

  return (
    <TouchableWithoutFeedback onPress={handleClose}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContainer}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.header}>
                {(isCreating || isImporting) && (
                  <Pressable
                    onPress={() => {
                      setIsCreating(false);
                      setIsImporting(false);
                      setNewAccountName("New Account");
                    }}
                    style={styles.backButton}>
                    <Image source={require("../assets/icons/arrow_back.png")} />
                  </Pressable>
                )}
                <Text style={styles.headerTitle}>
                  {isCreating
                    ? "Create New Account"
                    : isImporting
                    ? "Import Account"
                    : "Select Account"}
                </Text>
              </View>

              {isCreating ? (
                <View style={styles.createContainer}>
                  <Image
                    source={require("../assets/icons/avatar_2.png")}
                    style={styles.avatarLarge}
                  />
                  <TouchableOpacity style={styles.chooseIconButton}>
                    <Text style={styles.buttonText}>Choose an Icon</Text>
                  </TouchableOpacity>

                  <Text style={styles.label}>Account Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={newAccountName}
                    onChangeText={setNewAccountName}
                  />
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateAccount}>
                    <Text style={styles.buttonText}>Create Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsCreating(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : isImporting ? (
                <View style={styles.importContainer}>
                  <Text style={styles.modalDescription}>
                    Imported accounts are viewable in your wallet but are not
                    recoverable with your seed phrase.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Paste your private key string"
                    placeholderTextColor="#999"
                    value={privateKey}
                    onChangeText={setPrivateKey}
                  />
                  <View style={styles.importActionsContainer}>
                    <TouchableOpacity style={styles.scanButton}>
                      <Text style={styles.scanButtonText}>Scan a QR code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.importButton_2}
                      onPress={handleImportAccount}>
                      <Text style={styles.importButtonText}>Import</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsImporting(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.accountsContainer}>
                  <FlatList
                    data={accounts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAccountItem}
                    style={styles.accountsList}
                  />
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => setIsCreating(true)}>
                      <Text style={styles.buttonText}>Create New Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsImporting(true)}
                      style={styles.importButton}>
                      <Text style={styles.buttonText}>Import Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleClose}
                      activeOpacity={0.8}>
                      <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    maxHeight: "90%",
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
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  header: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  accountsContainer: {
    maxHeight: 500,
  },
  accountsList: {
    maxHeight: 300,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "bold",
  },
  balance: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  activeIcon: {
    width: 24,
    height: 24,
  },
  buttonContainer: {
    marginTop: 20,
  },
  createButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#5cb85c",
    marginBottom: 10,
  },
  importButton: {
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#337ab7",
    marginBottom: 10,
  },
  closeButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#d9534f",
    marginTop: 5,
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  createContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  importContainer: {
    paddingBottom: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  chooseIconButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#444",
    alignItems: "center",
    marginBottom: 20,
    width: "60%",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#444",
    color: Colors.white,
    fontSize: 16,
    marginBottom: 15,
  },
  label: {
    alignSelf: "flex-start",
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalDescription: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  importActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  scanButton: {
    padding: 10,
  },
  scanButtonText: {
    color: "#00aaff",
    fontSize: 16,
  },
  importButton_2: {
    padding: 15,
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
    backgroundColor: "#337ab7",
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#444",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddAccount;
