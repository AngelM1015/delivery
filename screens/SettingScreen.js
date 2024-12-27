import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Icons } from "../constants/Icons";
import { COLORS } from "../constants/colors";
import { base_url, orders } from "../constants/api";
import useUser from "../hooks/useUser";
import useOrders from "../hooks/useOrders";
import useOrder from "../hooks/useOrder";

const SettingScreen = ({ route }) => {
  const navigation = useNavigation();

  const { role, userEmail, userName } = useUser();
  // const { orders, fetchOrders } = useOrders();
  const { lastOrder, fetchLastOrder } = useOrder();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (role === "customer") {
      fetchLastOrder();
    }
  }, [role]);

  const renderOrderItem = () => {
    let statusText = "";
    let statusColor = "";

    switch (lastOrder.status) {
      case "delivered":
        statusText = "Completed";
        statusColor = "black";
        break;
      case "canceled":
        statusText = "Canceled";
        statusColor = "red";
        break;
      default:
        statusText = "In Progress";
        statusColor = "green";
        break;
    }

    return (
      <View style={styles.orderItem}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.orderTitle}>Order ID {lastOrder.id}</Text>
          <View
            style={{
              backgroundColor: "#f0f0f0",
              padding: 10,
              borderRadius: 16,
              width: "30%",
            }}
          >
            <Text style={{ color: statusColor, textAlign: "center" }}>
              {statusText}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Image
              source={{
                uri: lastOrder.image_url
                  ? base_url + lastOrder.image_url
                  : "../assets/images/icon.png",
              }}
              style={{ width: 80, height: 80, borderRadius: 10 }}
            />
            <View style={{ marginLeft: 15, gap: 10 }}>
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {lastOrder.restaurant_name}
              </Text>
              <Text style={{ color: COLORS.black, fontSize: 14 }}>
                {lastOrder.order_items
                  .map((orderItem) => orderItem.menu_item)
                  .join(", ")}
              </Text>
              <Text
                style={{ color: "#F09B00", fontSize: 14, fontWeight: "400" }}
              >
                ${lastOrder.total_price}
              </Text>
            </View>
          </View>
          <Text
            style={{ color: COLORS.black, fontWeight: "400", fontSize: 12 }}
          >
            {lastOrder.order_items.length} item
          </Text>
        </View>
      </View>
    );
  };

  const handleLogout = () => {
    setModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("hasOnBoarded");
      await AsyncStorage.removeItem("location");

      navigation.replace("Login");
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setModalVisible(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: handleLogout, style: "destructive" },
      ],
      { cancelable: true }
    );
  };

  const profileOptions = [
    {
      icon: <Icons.PersonalData />,
      text: "Personal Data",
      navigateTo: "PersonalData",
    },
    {
      icon: <Icons.SettingsIcon />,
      text: "Settings",
      navigateTo: "SettingEdit",
    },
    ...(role === "customer"
      ? [
          {
            icon: <Icons.ExtraCard />,
            text: "Payment Methods",
            navigateTo: "AddPaymentMethod",
          },
        ]
      : []),
  ];

  const support = [
    { icon: <Icons.HelpCenter />, text: "Help Center" },
    { icon: <Icons.DeleteIcon />, text: "Request Account Deletion" },
    // { icon:  <Icons.AdduserIcon/>, text: 'Add another account', navigateTo: 'Login' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 15, flexGrow: 1 }}>
        {/* {userRole === 'guest' ? (
        <GuestModeSignUpComponent navigation={navigation} />
      ) : (
        <>
          <View style={styles.settingItem}>
            <Text style={styles.text}>Activity Status:</Text>
            <TouchableOpacity
              style={[styles.activityButton, { backgroundColor: isActivityActive ? '#4CAF50' : '#FF6347' }]}
              onPress={toggleSwitch}
            >
              <Text style={styles.activityButtonText}>{isActivityActive ? 'Active' : 'Inactive'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logoutButtonContainer}>
            <Button title="Logout" onPress={confirmLogout} color="#FF6347" />
          </View>
          {statusPopupVisible && (
            <View style={styles.popupContainer}>
              <Text style={styles.popupText}>{isActivityActive ? 'Status: Active' : 'Status: Inactive'}</Text>
            </View>
          )}
        </>
      )} */}
        <View style={styles.header}>
          <Text style={styles.settingText}>Profile Setting</Text>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.profileImage}
          />
          <View style={{ marginTop: 15 }}>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
          </View>
        </View>
        {role === "customer" && (
          <View style={styles.ordersContainer}>
            <View style={styles.ordersHeader}>
              <Text style={styles.ordersHeaderText}>My Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
                <Text style={styles.ordersToggleText}>See All</Text>
              </TouchableOpacity>
            </View>
            {lastOrder ?
              renderOrderItem()
             : (
              <Text>
                No Order Available
              </Text>
            )}
          </View>
        )}

        <View style={styles.separator}></View>

        <Text style={{ marginLeft: 20, paddingTop: 10 }}>Profile</Text>
        <View style={styles.profileOptionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.text}
              style={styles.profileOption}
              onPress={() => navigation.navigate(option.navigateTo)}
            >
              {option.icon}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "90%",
                  alignItems: "center",
                }}
              >
                <Text style={styles.profileOptionText}>{option.text}</Text>
                <Icons.GotoIcon />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ marginLeft: 20, paddingTop: 10 }}>Support</Text>
        <View style={styles.profileOptionsContainer}>
          {support.map((option) => (
            <TouchableOpacity
              key={option.text}
              style={styles.profileOption}
              onPress={() =>
                Alert.alert(
                  "This feature is currently unavailable, it will be added soon!"
                )
              }
            >
              {option.icon}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "90%",
                  alignItems: "center",
                }}
              >
                <Text style={styles.profileOptionText}>{option.text}</Text>
                <Icons.GotoIcon />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.buttonContent}>
            <Icons.LogoutIcon style={styles.icon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </View>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sign Out</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icons.ClossIcon />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  color: "#878787",
                  fontFamily: "400",
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                Do you want to log out?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.logoutButton2}
                  onPress={handleConfirmLogout}
                >
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  orderTitle: {
    color: "#F09B00",
    fontSize: 14,
    fontWeight: "400",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  text: {
    fontSize: 18,
    color: "#000",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "400",
  },
  activityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  activityButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  logoutButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  popupContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  popupText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    // alignSelf: 'center'
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 5,
    alignSelf: "center",
  },
  email: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8F90A6",
    textAlign: "center",
  },
  ordersContainer: {
    padding: 15,
    backgroundColor: "#ffffff",
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ordersHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ordersToggleText: {
    fontSize: 16,
    color: "#F09B00",
    fontWeight: "600",
  },
  ordersList: {
    padding: 10,
  },
  orderItem: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowRadius: 4,
  },
  orderName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderPrice: {
    fontSize: 16,
    color: "#666",
  },
  orderStatus: {
    fontSize: 16,
    color: "#666",
  },
  separator: {
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
    margin: 20,
  },
  profileOptionsContainer: {
    padding: 10,
  },
  profileOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profileOptionText: {
    fontSize: 16,
    color: "#101010",
    fontWeight: "600",
    marginLeft: 15,
  },
  logoutButton: {
    padding: 20,
    backgroundColor: "#F09B00",
    width: "90%",
    alignSelf: "center",
    borderRadius: 16,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 10,
  },
  settingText: {
    color: "#101010",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  modalIcon: {
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#D6D6D6",
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginRight: 5,
  },
  cancelText: {
    color: COLORS.black,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
  },
  logoutButton2: {
    backgroundColor: "#F09B00",
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginLeft: 5,
  },
});

export default SettingScreen;
