import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
  Switch,
  Image,
} from "react-native";
import {
  Card,
  Button,
  Text,
  Modal,
  Portal,
  Provider,
  Snackbar,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";
import cable from "../cable";
import { base_url } from "../constants/api";

const formatStatus = (status) => {
  return status
    .split("_")
    .map((word) => word[0].toUpperCase() + word.substr(1).toLowerCase())
    .join(" ");
};

const abbreviateStatus = (status) => {
  const abbreviations = {
    restaurant_pending_approval: "RPA",
    restaurant_approved: "RA",
    partner_pending_assignment: "PPA",
    partner_assigned: "PA",
    delivered: "Del",
    canceled: "Can",
  };
  return abbreviations[status] || status;
};

const processChartData = (orders, userRole) => {
  if (!Array.isArray(orders)) return { labels: [], datasets: [{ data: [] }] };
  const statusCounts = orders.reduce((acc, order) => {
    const abbrStatus = abbreviateStatus(order.status);
    acc[abbrStatus] = (acc[abbrStatus] || 0) + 1;
    return acc;
  }, {});
  return {
    labels: Object.keys(statusCounts),
    datasets: [{ data: Object.values(statusCounts) }],
  };
};

const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strTime =
    hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + " " + ampm;
  return strTime;
};

const MetricScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [restaurant, setRestaurant] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(false); // State for order history modal

  const toggleStatus = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const cableUrl = `ws://192.168.150.63:3000/cable?token=${token}`;
    };
    fetchToken();
    fetchUserRoleAndOrders();
  }, []);

  const fetchUserRoleAndOrders = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("userToken");
    const role = await AsyncStorage.getItem("userRole");
    setUserRole(role);
    const headers = { Authorization: `Bearer ${token}` };
    let apiUrl = `${base_url}api/v1/orders`;
    apiUrl +=
      role === "restaurant_owner"
        ? "/restaurant_orders"
        : role === "admin"
          ? "/all_orders"
          : "/partner_pending_orders";
    try {
      const response = await axios.get(apiUrl, { headers });
      setOrders(response.data);
      setRestaurant(response.data[0]["restaurant_id"]);
      console.log("restaurant", response.data[0]["restaurant_id"]);
      response.data.forEach((order) =>
        handleReceived({ order_id: order.id, status: order.status })
      );

      if (role === "restaurant_owner") {
        restaurantSubscription(response.data[0]["restaurant_id"]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const restaurantSubscription = async (id) => {
    const restaurantId = id;

    subscription = cable.subscriptions.create(
      { channel: "RestaurantChannel", id: restaurantId },
      {
        received: (data) => {
          console.log("data", data);
          setOrders((prevOrders) => [data, ...prevOrders]);
        },
      }
    );

    console.log("restaurant subscription", subscription);
  };

  const onRefresh = () => {
    fetchUserRoleAndOrders();
  };

  const handleReceived = (data) => {
    const { order_id, status } = data.order
      ? { order_id: data.order.id, status: data.order.status }
      : data;

    console.log("Data Order Id: ", order_id, ", Received data: ", data);

    if (data.message && data.message.startsWith("Order status updated")) {
      setSnackbarMessage(
        `Status updated to, ${status.replace(/_|-|\\. /g, " ")}`
      );
      setSnackbarVisible(true);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === order_id ? { ...order, status: status } : order
        )
      );
    }
  };

  const updateOrderStatus = async (id, status) => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      await axios.put(
        `${base_url}api/v1/orders/${id}/update_status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );
      setSnackbarMessage(
        `Status updated to ${status.replace(/_|-|\\. /g, " ")}`
      );
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const chartData = processChartData(orders, userRole);

  const renderItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={styles.orderType}>{item.order_type}</Text>
      </View>
      <View
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={styles.orderId}> Order ID: {item.id}</Text>
        <Text style={styles.remainingTime}> 1 m 30 s</Text>
        <Text style={styles.orderTime}> {formatTime(item.created_at)}</Text>
      </View>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={styles.menuItemName}>{item.order_items[0].menu_item}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 5 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}> Restaurant: </Text>
        <Text style={styles.menuText}>{item.restaurant_name}</Text>
      </View>
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => updateOrderStatus(item.id, "canceled")}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonText}
        >
          Cancel order
        </Button>
        <Button
          mode="contained"
          onPress={() => updateOrderStatus(item.id, "restaurant_approved")}
          style={styles.acceptButton}
          labelStyle={styles.acceptButtonText}
        >
          Accept order
        </Button>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={styles.orderType}>{item.order_type}</Text>
      </View>
      <View
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={styles.orderId}> Order ID: {item.id}</Text>
      </View>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={styles.menuItemName}>{item.order_items[0].menu_item}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 5 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}> Status: </Text>
        <Text style={styles.menuText}>{formatStatus(item.status)}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 5 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}> Restaurant: </Text>
        <Text style={styles.menuText}>{item.restaurant_name}</Text>
      </View>
    </View>
  );

  return (
    <Provider>
      <View style={styles.container}>
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
        <FlatList
          data={orders.filter(
            (order) => order.status === "restaurant_pending_approval"
          )}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.flatList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <Portal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            {snackbarMessage}
          </Snackbar>
          <Modal
            visible={historyVisible}
            onDismiss={() => setHistoryVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <FlatList
              data={orders.filter(
                (order) => order.status !== "restaurant_pending_approval"
              )} // Filter orders for history
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.flatList}
            />
          </Modal>
        </Portal>
      </View>
      <Button
        mode="contained"
        onPress={() => setHistoryVisible(true)} // Show order history modal
        style={styles.orderHistoryButton}
      >
        Order History
      </Button>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Change background color to light gray
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  orderId: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  orderTime: {
    fontSize: 16,
    marginBottom: 8,
  },
  remainingTime: {
    fontSize: 16,
    marginBottom: 8,
    color: "#FF0B5C",
  },
  menuItem: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1, // Add border width
    borderColor: "#ddd", // Add border color
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    padding: 10,
  },
  menuText: {
    fontSize: 18,
    color: "grey",
  },
  icon: {
    marginRight: 10,
  },
  flatList: {
    marginTop: 10,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  orderType: {
    color: "#06C270",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  activeContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
  },
  ActiveLabel: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderColor: "#FF0B5C",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "#FF0B5C",
  },
  acceptButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#F09B00",
  },
  acceptButtonText: {
    color: "#fff",
  },
  menuItemName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 20,
    color: "#F09B00",
  },
  orderHistoryButton: {
    width: "90%",
    borderRadius: 10, // Make the button less rounded
    marginBottom: 10,
    backgroundColor: "#F09B00",
    alignSelf: "center",
    margin: 10,
    padding: 10,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MetricScreen;
