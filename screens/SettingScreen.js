import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  Stack,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Icons } from "../constants/Icons";
import { COLORS } from "../constants/colors";
import { base_url } from "../constants/api";
import useUser from "../hooks/useUser";
import useOrder from "../hooks/useOrder";
import useSubscription from "../hooks/useSubscription";
import LottieView from "lottie-react-native";
import FavoriteFoodMenuItemScreen from "../screens/FavoriteFoodMenuItemScreen";
import SubscriptionPlansModal from "../components/SubscriptionPlansModal";

<Stack
  name="FavoriteFoodMenuItemScreen"
  component={FavoriteFoodMenuItemScreen}
  options={{ title: "Favorites" }}
/>;

const SettingScreen = ({ route }) => {
  const navigation = useNavigation();

  const { role, userEmail, userName } = useUser();
  const { lastOrder, fetchLastOrder } = useOrder();
  const {
    subscriptionStatus,
  } = useSubscription();
  const [modalVisible, setModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);

  useEffect(() => {
    if (role === "customer") {
      fetchLastOrder();
    }
  }, [role]);

  const handleSubscriptionAction = () => {
    if (role !== "customer") {
      Alert.alert("Access Denied", "Subscription is only available for customers.");
      return;
    }
    setSubscriptionModalVisible(true);
  };

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

  const handleSubmit = () => {
    if (role === "guest") {
      navigation.navigate("SignupScreen");
    } else {
      setModalVisible(true);
    }
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

  const profileOptions = [
    ...(role != "guest"
      ? [
          {
            icon: <Icons.PersonalData />,
            text: "Personal Data",
            navigateTo: "PersonalData",
          },
        ]
      : []),
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
          {
            icon: <Icons.ExtraCard />,
            text: subscriptionStatus?.has_subscription ? "Manage Subscription" : "Subscribe Now",
            onPress: handleSubscriptionAction,
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
        {role != "guest" ? (
          <>
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
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Orders")}
                  >
                    <Text style={styles.ordersToggleText}>See All</Text>
                  </TouchableOpacity>
                </View>
                {lastOrder ? (
                  renderOrderItem()
                ) : (
                  <Text>No Order Available</Text>
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
                  onPress={() => {
                    if (option.navigateTo) {
                      navigation.navigate(option.navigateTo);
                    } else if (option.onPress) {
                      option.onPress();
                    }
                  }}
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
            <TouchableOpacity
              style={{
                backgroundColor: "#F09B00",
                margin: 20,
                padding: 15,
                borderRadius: 12,
                alignItems: "center",
              }}
              onPress={() =>
                navigation.navigate("FavoriteFoodMenuItemScreen", {
                  restaurantId: 1, // replace with dynamic value if needed
                })
              }
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Browse Favorites
              </Text>
            </TouchableOpacity>
            <View style={styles.profileOptionsContainer}>
              {support.map((option) => (
                <TouchableOpacity
                  key={option.text}
                  style={styles.profileOption}
                  onPress={() =>
                    Alert.alert(
                      "This feature is currently unavailable, it will be added soon!",
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
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <View style={styles.lottieContainer}>
              <LottieView
                source={require("../assets/lottie-images/404-Error.json")}
                style={styles.lottieAnimation}
                autoPlay
                speed={0.5} // Slightly slower than normal (1.0)
              />
            </View>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 26,
                textAlign: "center",
                color: "#333",
              }}
            >
              Ouch! Hungry
            </Text>
            <Text style={styles.displayMessage}>
              Seems like you have not ordered any food yet
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.logoutButton,
            role === "guest" && { position: "absolute", bottom: 4 },
          ]}
          onPress={handleSubmit}
        >
          <View style={styles.buttonContent}>
            <Icons.LogoutIcon style={styles.icon} />
            {role === "guest" ? (
              <Text style={styles.logoutButtonText}>
                Register To Order Food
              </Text>
            ) : (
              <Text style={styles.logoutButtonText}>Logout</Text>
            )}
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

        <SubscriptionPlansModal
          visible={subscriptionModalVisible}
          onClose={() => setSubscriptionModalVisible(false)}
          initialSubscriptionStatus={subscriptionStatus}
        />
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
  emptyCartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 25,
    flex: 1,
  },
  displayMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    maxWidth: "70%",
    alignSelf: "center",
    marginTop: 10,
  },
  lottieContainer: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 20,
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
  subscriptionPlans: {
    width: '100%',
    marginTop: 20,
  },
  planOption: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F09B00',
    marginBottom: 10,
  },
  planFeatures: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  noPlansText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default SettingScreen;
