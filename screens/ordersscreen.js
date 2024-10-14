import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import noOrderCart from "../assets/images/Illustration.png"; // Adjust the path as necessary

const OrdersScreen = ({ navigation }) => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [orderCount, setOrderCount] = useState(
    AsyncStorage.getItem("orderCount")
  );

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const role = await AsyncStorage.getItem("userRole");

      setUserRole(role);
      if (token && role === "customer") {
        fetchOrders(token, role);
      }
    };

    initialize();
  }, [orderCount]);

  const fetchOrders = async (token, role) => {
    setLoading(true);
    try {
      let url = "http://192.168.201.164:3000/api/v1/orders";
      if (role === "customer") {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrdersData(response.data);
      } else {
        setOrdersData([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const role = await AsyncStorage.getItem("userRole");
    fetchOrders(token, role);
  };

  const handleOrderAction = async (orderId, action) => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      const url = `http://192.168.201.164:3000/api/v1/orders/${orderId}/${action}`;
      await axios.patch(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchOrders(token, userRole);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleOrderClick = (order) => {
    console.log("Navigating to OngoingOrderScreen with order ID:", order.id);
    console.log("Available Navigators:", navigation.getState().routeNames);
    if (order.status !== "delivered" && order.status !== "canceled") {
      navigation.navigate("OngoingOrderScreen", { id: order.id });
    } else {
      navigation.navigate("OrderDetailScreen", { orderId: order.id });
    }
  };

  const renderOrderItem = ({ item }) => {
    let statusText = "";
    let statusColor = "";

    switch (item.status) {
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
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => handleOrderClick(item)}
      >
        <Text style={styles.orderTitle}>Order #{item.id}</Text>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>

        {userRole === "partner" && (
          <View>
            <Button
              title="Pick Up Order"
              onPress={() => handleOrderAction(item.id, "start_delivery")}
            />
            <Button
              title="Deliver Order"
              onPress={() =>
                handleOrderAction(item.id, "partner_deliver_order")
              }
            />
          </View>
        )}
        {userRole === "customer" &&
          item.status !== "canceled" &&
          item.status !== "delivered" &&
          item.status !== "picked_up" && (
            <Button
              title="Cancel Order"
              onPress={() => handleOrderAction(item.id, "cancel_order")}
            />
          )}
      </TouchableOpacity>
    );
  };

  const NoOrdersView = () => (
    <View style={styles.noOrdersContainer}>
      {/* <View style={styles.circle}>
        <Ionicons name="search" size={64} color="white" />
      </View> */}
      <View style={styles.imageAndHungryContainer}>
        <Image source={noOrderCart} style={styles.noOrderCartImage} />
        <View style={styles.noOrdersTitleWrapper}>
          <Text style={styles.noOrdersTitle}>Ouch! Hungry</Text>
          <Text style={styles.noOrdersText}>
            Seems like you have not ordered any food yet
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.findFoodButton} onPress={() => {}}>
        <Text style={styles.findFoodButtonText}>Find Foods</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order now</Text>
      </View>
      <FlatList
        data={ordersData}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={NoOrdersView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  orderItem: {
    padding: 20,
    margin: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    position: "relative",
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    height: "100%",
    marginTop: "25%",
  },
  circle: {
    width: 150,
    height: 150,
    backgroundColor: "#FFA500", // Orange color
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  noOrdersTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noOrdersText: {
    fontSize: 16,
    fontFamily: "Lato",
    color: "#666",
    fontWeight: "400",
    lineHeight: 27.2,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  findFoodButton: {
    marginTop: 17,
    backgroundColor: "#F09B00",
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: "100%",
    display: "flex",
    alignItems: "center",
    borderRadius: 16,
  },
  findFoodButtonText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
    gap: 10,
  },
  noOrderCartImage: {
    width: 278,
    height: 207,
    gap: 0,
  },
  imageAndHungryContainer: {
    fontFamily: "Lato",
    display: "flex",
    alignItems: "center",
    gap: 25,
    lineHeight: 33.8,
  },
  noOrdersTitleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderBottomWidth: 0,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    left: 10,
    padding: "auto",
    width: 36, // Fixed width
    height: 36, // Fixed height
    gap: 0, // Gap
    borderRadius: 100, // Border radius
    borderWidth: 1, // Border width
    borderColor: "#EDEDED", // Border color
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
});

export default OrdersScreen;
