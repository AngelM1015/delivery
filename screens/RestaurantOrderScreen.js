import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url } from "../constants/api";

const RestaurantOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const role = await AsyncStorage.getItem("userRole");
        setUserRole(role);
        if (!token) {
          setError("User token not found.");
          Alert.alert("Authentication Error", "User token not found.");
          return;
        }
        fetchOrders(token, role);
        const intervalId = setInterval(() => fetchOrders(token, role), 1800000);

        return () => clearInterval(intervalId);
      } catch (err) {
        console.error("Error during initialization:", err);
        setError(err.message);
      }
    };

    initialize();
  }, []);

  const fetchOrders = async (token, role) => {
    try {
      setLoading(true);
      let url = `${base_url}api/v1/orders/partner_pending_orders`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      if (userRole !== "partner") {
        Alert.alert("Unauthorized", "Only partners can accept orders.");
        return;
      }
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${base_url}api/v1/orders/accept_order`,
        { order_id: orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(token, userRole);
    } catch (err) {
      console.error(
        "Request Error:",
        err.response ? err.response.data : err.message
      );
      Alert.alert(
        "Request Error",
        err.response
          ? err.response.data.error
          : "An error occurred while accepting the order."
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderText}>Order ID: {item.id}</Text>
      {item.user && (
        <Text>
          Customer: {item.user.first_name} {item.user.last_name}
        </Text>
      )}
      <Text>Address: {item.delivery_address}</Text>
      {userRole === "partner" && (
        <Button
          title="Accept Order"
          onPress={() => acceptOrder(item.id)}
          color="#007bff"
        />
      )}
    </View>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  if (orders.length === 0)
    return (
      <View style={styles.centered}>
        <Text>No orders available</Text>
      </View>
    );

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  orderItem: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderText: { fontSize: 16, color: "#333" },
  loadingText: { marginTop: 10, fontSize: 18, color: "#007bff" },
  errorText: { marginTop: 10, fontSize: 18, color: "red" },
});

export default RestaurantOrderScreen;
