import React, { useState, useEffect } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Switch
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PartnerOrders from "../components/PartnerOrders";
import { base_url } from "../constants/api";
import cable from "../cable";
import Toast from "react-native-toast-message";

const DashboardScreen = () => {
  const [role, setRole] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [newOrders, setNewOrders] = useState([]);
  const [isActive, setIsActive] = useState(true);

  const sendLocationToBackend = async (subscription) => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync();
      console.log("location fetched: ", currentLocation.coords);

      if (subscription && typeof subscription.sendLocation === "function") {
        subscription.sendLocation({ location: currentLocation.coords });
        console.log("location sent: ", currentLocation.coords);
      } else {
        console.error("subscription.sendLocation is not a function or subscription is undefined");
      }
    } catch (error) {
      console.error("Error sending location to backend:", error);
    }
  };

  useEffect(() => {
    const fetchRoleAndData = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setRole(role);
      if (role === "partner") {
        await fetchData(role);
      }

      const userId = await AsyncStorage.getItem("userId");
      if (role === "partner") {
        const currentLocation = await Location.getCurrentPositionAsync();
        console.log("current location", currentLocation.coords);

        if (cable.connection.isOpen()) {
          console.log("WebSocket connection is open.");
        } else {
          console.log("WebSocket connection is not open.");
        }
        console.log("user id", userId);

        const subscription = await cable.subscriptions.create(
          { channel: "PartnerChannel", id: userId },
          {
            received(data) {
              console.log("New order notification:", data);
              if (data.new_order) {
                console.log('in new orderr assignement!')
                addNewOrder(data.new_order);
                // Toast.show({
                //   type: "success",
                //   text1: "New Order Assigned!",
                //   text2: `Order from ${data.new_order.restaurant_name}`,
                //   position: "top",
                // });
              }
              else {
                console.log('in new orderr request!')
                // Toast.show({
                //   type: "success",
                //   text1: "New Order Request",
                //   text2: `Order from ${data.new_order.restaurant_name}`,
                //   position: "top",
                // });
              }
            },

            sendLocation(locationData) {
              this.perform("send_location", { location: locationData });
            },
          }
        );
        console.log("subscription", subscription);

        const intervalId = setInterval(
          () => sendLocationToBackend(subscription),
          10000
        );

        return () => {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error("Error during WebSocket cleanup:", error);
          } finally {
            clearInterval(intervalId);
          }
        };
      }
    };

    const fetchData = async (role) => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        let endpoint = "orders/partner_orders"

        const response = await axios.get(`${base_url}api/v1/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(response.data);
        groupOrders(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    console.log('subscriptions: ', cable.subscriptions);

    fetchRoleAndData();
  }, []);

  const toggleStatus = () => {
    setIsActive(!isActive);
  };

  const groupOrders = (partnerOrders) => {
    const groupedOrders = partnerOrders.reduce((x, y) => {
      (x[y.status] = x[y.status] || []).push(y);
      return x;
    }, {});

    setCompletedOrders(groupedOrders.delivered?.length || 0);
    setCanceledOrders(groupedOrders.canceled?.length || 0);
  };

  const addNewOrder = (newOrder) => {
    setNewOrders((prevOrders) => [...prevOrders, newOrder]);
    setTimeout(() => {
      setNewOrders((prevOrders) => prevOrders.filter((order) => order.id !== newOrder.id));
    }, 10000);
  };


  const renderDashboard = () => {
    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (role === "partner") {
      return (
        <>
          <View style={styles.activeContainer}>
            <Text style={styles.ActiveLabel}>Active Status</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#F09B00" }}
              thumbColor={isActive ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleStatus}
              value={isActive}
              style={styles.switch}
            />
          </View>
          <ScrollView style={styles.newOrdersContainer}>
            {newOrders.map((order) => (
              <View key={order.id} style={styles.newOrderCard}>
                <Text style={styles.newOrderText}> {`Order Id:  ${order.id}`}</Text>
                <Text style={styles.newOrderText}>{`Order from ${order.restaurant_name}`}</Text>
                <Text style={styles.newOrderText}> {`Order Items:  ${order.order_items} items`}</Text>
                <Text style={styles.newOrderText}> {`Order Price:  $${order.price}`}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <View style={styles.orderGroups}>
              <Text style={styles.canceledOrders}> {canceledOrders} Cancel</Text>
              <Text style={styles.completedOrders}>
                {completedOrders} Completed
              </Text>
            </View>
            <TouchableOpacity
              style={styles.orderHistoryButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.orderHistoryButtonText}>Order History</Text>
            </TouchableOpacity>
            <PartnerOrders
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              orders={orders}
            />
          </View>
        </>
      );
    } else if (role === "admin") {
      return <Text>Hi Admin</Text>;
    } else {
      return <Text>Role-specific data not available.</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {renderDashboard()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    // backgroundColor: "#f0f0f0",
    padding: 4
  },
  activeContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 14,
  },
  ActiveLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  newOrdersContainer: {
    flex: 1,
    padding: 10,
  },
  newOrderCard: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { height: 4 },
    shadowOpacity: 0.15,
    padding: 10,
  },
  newOrderText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 20,
    color: "#F09B00",
  },
  footer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#DDD",
  },
  orderGroups: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  canceledOrders: {
    color: "red",
    fontSize: 20,
  },
  completedOrders: {
    color: "green",
    fontSize: 20,
  },
  orderHistoryButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  orderHistoryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#F09B00",
  },
});

export default DashboardScreen;
