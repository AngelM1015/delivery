import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
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

  const updateOrderStatus = async (id) => {
    if (!selectedOrderId) return;

    const token = await AsyncStorage.getItem("userToken");

    const response = await axios.put(
      `${base_url}api/v1/orders/${id}/update_status`,
      { status: selectedStatus },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setModalVisible(false);
  };

  const chartData = processChartData(orders, userRole);

  const renderItem = ({ item }) => (
    <Card style={styles.menuItem}>
      <Card.Content style={{ gap: 5 }}>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.orderId}> Order #{item.id}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}> Status: </Text>
          <Text style={styles.menuText}>{formatStatus(item.status)}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {" "}
            Restaurant:{" "}
          </Text>
          <Text style={styles.menuText}>{item.restaurant_name}</Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Ionicons
          name="create-outline"
          size={24}
          onPress={() => {
            setModalVisible(true);
            setSelectedStatus(item.status);
            setSelectedOrderId(item.id);
          }}
        />
        <Ionicons
          name="information-circle-outline"
          size={24}
          onPress={() =>
            navigation.navigate("OrderDetailScreen", { orderId: item.id })
          }
        />
      </Card.Actions>
    </Card>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Metrics Screen</Text>
        <BarChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          verticalLabelRotation={30}
          style={{ marginVertical: 10, borderRadius: 16 }}
        />
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.flatList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
          >
            <Card style={styles.modalContent}>
              <Card.Title
                title="Update Order Status"
                right={(props) => (
                  <Ionicons
                    {...props}
                    name="close"
                    onPress={() => setModalVisible(false)}
                  />
                )}
              />
              <Card.Content>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                >
                  <Picker.Item label="Approved" value="restaurant_approved" />
                  <Picker.Item label="Canceled" value="canceled" />
                </Picker>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => updateOrderStatus(selectedOrderId)}>
                  Update Status
                </Button>
              </Card.Actions>
            </Card>
          </Modal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            {snackbarMessage}
          </Snackbar>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  orderId: {
    color: "#F09B00",
    fontSize: 24,
    marginBottom: 8,
  },
  menuItem: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
});

export default MetricScreen;
