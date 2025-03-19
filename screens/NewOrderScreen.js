import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Switch,
  TouchableOpacity,
  TextInput,
  Button as RNButton,
  Modal
} from "react-native";
import {
  Button,
  Text,
  Portal,
  Provider,
  Snackbar,
  Modal as HistoryModal,
} from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import cable from "../cable";
import { base_url } from "../constants/api";
import Icon from 'react-native-vector-icons/MaterialIcons';


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

const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime =
    hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + " " + ampm;
  return strTime;
};

const NewOrderScreen = ({ navigation }) => {

  const [orders, setOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [restaurant, setRestaurant] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const toggleStatus = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    fetchOrdersWithPolling();
    fetchRestaurantNewOrders();
  }, []);

  const fetchRestaurantNewOrders = async () => {
    setRefreshing(true);
    const token = await AsyncStorage.getItem("userToken");
    const headers = { Authorization: `Bearer ${token}` };
    let apiUrl = `${base_url}api/v1/orders`;
    apiUrl += "/restaurant_orders";

    try {
      const response = await axios.get(apiUrl, { headers });
      setOrders(response.data);
      setRestaurant(response.data[0]["restaurant_id"]);
      console.log("restaurant", response.data[0]["restaurant_id"]);
      response.data.forEach((order) =>
        handleReceived({ order_id: order.id, status: order.status })
      );

      restaurantSubscription(response.data[0]["restaurant_id"]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchOrdersWithPolling = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = `${base_url}api/v1/orders/new_restaurant_orders`;

      while (true) {
        const response = await axios.get(apiUrl, { headers });
        const newestOrders = response.data || [];

        if(newestOrders.length > 0){
          setNewOrders((prevOrders) => {
            const existingOrderIds = new Set(prevOrders.map((order) => order.id));
            const uniqueNewOrders = newestOrders.filter(
              (order) => !existingOrderIds.has(order.id)
            );
            return [...uniqueNewOrders, ...prevOrders];
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 20000));
      }
    } catch (error) {
      console.error("Error with polling:", error);
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
    fetchOrdersWithPolling();
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

  const updateOrderStatus = async (id, status, cancellationReason = null) => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      await axios.put(
        `${base_url}api/v1/orders/${id}/update_status`,
        { status, cancellation_reason: cancellationReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );

      setNewOrders((prevNewOrders) =>
        prevNewOrders.filter((order) => order.id !== id)
      );
      setSnackbarMessage(
        `Status updated to ${status.replace(/_|-|\\. /g, " ")}`
      );
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleCancelOrder = () => {
    setModalVisible(true);
  };

  const handleConfirmCancel = (item) => {
    if (cancellationReason) {
      updateOrderStatus(item.id, "canceled", cancellationReason);
      setModalVisible(false);
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderItem}>
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
        <Text style={styles.textValue}>{item.restaurant_name}</Text>
      </View>
      <View style={styles.actions}>
      <Button
        mode="contained"
        onPress={handleCancelOrder}
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.cancelModalContainer}>
          <View style={styles.cancelModalContent}>
            <TouchableOpacity
              style={styles.crossButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}>
              Cancellation Reason
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter cancellation reason"
              value={cancellationReason}
              onChangeText={setCancellationReason}
            />
            <RNButton
              title="Confirm Cancel"
              onPress={() => handleConfirmCancel(item)}
              disabled={!cancellationReason}
            />
            <RNButton
              title="Accept Order"
              onPress={() => {
                updateOrderStatus(item.id, "restaurant_approved");
                setModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
    </View>
  );

  const showDetails = (orderId) => {
    navigation.navigate("OrderDetails", { orderId: orderId })
  }

  const renderOrderHistory = ({ item }) => (
    <TouchableOpacity onPress={() => showDetails(item.id)}>
    <View style={styles.orderItem}>
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
        <Text style={styles.textValue}>{formatStatus(item.status)}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 5 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}> Restaurant: </Text>
        <Text style={styles.textValue}>{item.restaurant_name}</Text>
      </View>
    </View>
    </TouchableOpacity>
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
          data={newOrders}
          renderItem={renderOrder}
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
          <HistoryModal
            animationType="slide"
            visible={historyVisible}
            onRequestClose={() => setHistoryVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHistoryVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <FlatList
              data={orders.filter(
                (order) => order.status !== "restaurant_pending_approval"
              )}
              renderItem={renderOrderHistory}
              keyExtractor={(item) => item.id.toString()}
              style={styles.flatList}
            />
          </HistoryModal>
        </Portal>
      </View>
      <Button
        mode="contained"
        onPress={() => setHistoryVisible(true)}
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
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    marginTop: 40,
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
  orderItem: {
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
  textValue: {
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
    padding: 10,
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
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 14,
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
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F09B00",
    alignSelf: "center",
    margin: 10,
    padding: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#FFA500",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  cancelModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cancelModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  crossButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default NewOrderScreen;
