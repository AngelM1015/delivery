import React, { useState, useEffect } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PartnerOrders from "../components/PartnerOrders";
import { base_url } from "../constants/api";
import cable from "../cable";
import client from "../client";
import useUser from "../hooks/useUser";

const DashboardScreen = () => {
  const { role, token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [newOrders, setNewOrders] = useState([]);
  const [isActive, setIsActive] = useState(false);

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
      await fetchData(role);
      const status = await AsyncStorage.getItem('status');
      setIsActive(status === 'true');
    };

    const fetchData = async (role) => {
      setLoading(true);
      try {
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
  }, [token, role]);

  useEffect(() => {
    const setupWebSocket = async () => {
      const userId = await AsyncStorage.getItem("userId");
  
      const subscription = cable.subscriptions.create(
        { channel: "PartnerChannel", id: userId },
        {
          received(data) {
            console.log("New order notification:", data);
            if (data.new_order) {
              addNewOrder(data.new_order);
            } else if (data.order_request) {
              addNewOrder(data.order_request);
              console.log("New order request:", data.order_request);
            }
          },
          connected() {
            console.log("WebSocket connected");
          },
          disconnected() {
            console.log("WebSocket disconnected. Reconnecting...");
            setTimeout(setupWebSocket, 5000); // Reconnect after 5 seconds
          },
          sendLocation(locationData) {
            this.perform("send_location", { location: locationData });
          }
        }
      );

      const intervalId = setInterval(
        () => sendLocationToBackend(subscription),
        10000
      );

      return () => {
        subscription.unsubscribe();
        clearInterval(intervalId);
      };
    };
  
    setupWebSocket();
  }, []);

  const toggleStatus = async () => {
    setLoading(true);

    try {
      const partnerId = await AsyncStorage.getItem('userId');
      const url = `api/v1/users/${partnerId}/change_activity_status`

      await client.patch(url, {status: isActive ? 'inactive' : 'active'},
        { headers: {Authorization: `Bearer ${token}`}}
      )

      setIsActive(!isActive)
    } catch (error) {
      console.log('error', error);
      Alert.alert('Error while updating Activity Status')
    } finally {
      setLoading(false);
    }
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
    setNewOrders((prevOrders) => {
      const orderExists = prevOrders.some((order) => order.order_id === newOrder.order_id);
  
      if (!orderExists) {
        return [...prevOrders, newOrder];
      } else {
        return prevOrders;
      }
    });
  
    // Remove the order after 10 seconds
    setTimeout(() => {
      setNewOrders((prevOrders) =>
        prevOrders.filter((order) => order.order_id !== newOrder.order_id)
      );
    }, 10000);
  };

  const handleAcceptOrder = (orderId) => {
    const subscription = cable.subscriptions.subscriptions.find(
      (sub) => sub.identifier.includes("PartnerChannel")
    );
  
    if (subscription) {
      subscription.perform("accept_order", { order_id: orderId });
    }
  };

  const renderDashboard = () => {
    if (loading && !orders.length > 0) {
      return <Text>Loading...</Text>;
    }

    if (role === "partner") {
      return (
        <>
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FFA500" />
            </View>
          )}
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
            <View key={order.order_id} style={styles.newOrderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderIdText}>{`Order # ${order.order_id}`}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Price: </Text>
                  <Text style={styles.priceText}>{`$${order.price}`}</Text>
                </View>
              </View>

              <View style={styles.orderForContainer}>
                <Text style={styles.orderForLabel}>Order For</Text>
                <Text style={styles.orderForValue}>{order.restaurant_name}</Text>
              </View>

              <View style={styles.addressContainer}>
                <Text style={styles.deliveryAddressContainer}>
                  <Text style={styles.deliveryAddressLabel}>Delivery Address: </Text>
                  {order.delivery_address}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={() => handleAcceptOrder(order.order_id)}
                style={styles.acceptButton}
                labelStyle={styles.acceptButtonText}
              >
                Accept order
              </Button>
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
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  activeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 14,
  },
  ActiveLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
    padding: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F09B00",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "red",
  },
  orderForContainer: {
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderForLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderForValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F09B00",
  },
  addressContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  deliveryAddressContainer: {
    fontSize: 14,
    color: "grey",
    lineHeight: 20,
  },
  deliveryAddressLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  acceptButton: {
    flex: 1,
    marginHorizontal: 'auto',
    backgroundColor: "#F09B00",
    marginTop: 12,
    paddingVertical: 8, // ↓ was 12
    borderRadius: 8, // Optional: tighter rounding
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
    paddingVertical: 6,
    fontSize: 15    
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
});

export default DashboardScreen;
