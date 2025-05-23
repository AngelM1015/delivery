import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Image,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { COLORS } from "../constants/colors";
import useOrders from "../hooks/useOrders";
import { base_url } from "../constants/api";
import { Icons } from "../constants/Icons";
import { max } from "moment";

const OrdersScreen = ({ navigation }) => {
  const { role, orders, loading, fetchOrders, cancelOrder } = useOrders();

  const handleOrderClick = (order) => {
    if (order.status !== "delivered" && order.status !== "canceled") {
      navigation.navigate("OngoingOrder", { id: order.id });
    } else {
      navigation.navigate("OrderDetails", { orderId: order.id });
    }
  };

  const renderOrderItem = ({ item: order }) => {
    let statusText = "";
    let statusColor = "";

    switch (order.status) {
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

    const getProgress = () => {
      if (order.status === "restaurant_pending_approval") return 0;
      if (order.status === "partner_assigned") return 0.5;
      if (order.status === "picked_up") return 1;
      return 0;
    };

    const progressMessage =
      order.status === "partner_assigned"
        ? "Order is being prepared"
        : order.status === "picked_up"
        ? "Order is on the way"
        : order.status === "restaurant_pending_approval"
        ? "waiting for restaurant approval"
        : "";

    return (
      <TouchableOpacity onPress={() => handleOrderClick(order)}>
        <View style={styles.orderItem}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.orderTitle}>Order ID {order.id}</Text>
            {/* {statusText} */}
            {role === "customer" && statusText == "In Progress" ? (
              order.status !== "canceled" &&
              order.status !== "delivered" &&
              order.status !== "picked_up" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => cancelOrder(order.id)}
                >
                  <Text style={{ color: "white" }}>Cancel Order</Text>
                </TouchableOpacity>
              )
            ) : (
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
            )}
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
                  uri: order.image_url
                    ? base_url + order.image_url
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
                  {order.restaurant_name}
                </Text>
                <Text style={{ color: "grey", fontSize: 14, maxWidth: "70%" }}>
                  {order.order_items.map((item) => item.menu_item).join(", ")}
                </Text>
                <Text style={{ color: "#F09B00", fontSize: 14 }}>
                  ${order.total_price}
                </Text>
              </View>
            </View>
            <Text
              style={{ color: COLORS.black, fontWeight: "400", fontSize: 12 }}
            >
              {order.order_items.length} item
            </Text>
          </View>
          {/* Progress Bar */}
          {(order.status === "partner_assigned" ||
            order.status === "picked_up" ||
            order.status === "restaurant_pending_approval") && (
            <View>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <ProgressBar
                  progress={getProgress() > 0 ? 1 : 0}
                  color="#4caf50"
                  style={{ marginTop: 20 }}
                  indeterminate={order.status === "restaurant_pending_approval"}
                  containerHeight={100}
                  width={"32%"}
                />
                <ProgressBar
                  progress={getProgress() >= 0.5 ? 1 : 0}
                  color="#4caf50"
                  style={{ marginTop: 20 }}
                  indeterminate={order.status === "partner_assigned"}
                  containerHeight={100}
                  width={"32%"}
                />
                <ProgressBar
                  progress={getProgress() === 1 ? 1 : 0}
                  color="#4caf50"
                  style={{ marginTop: 20 }}
                  indeterminate={order.status === "picked_up"}
                  containerHeight={100}
                  width={"32%"}
                />
              </View>

              <Text style={{ textAlign: "center", marginTop: 5 }}>
                {progressMessage}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ marginHorizontal: 10 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.BackIcon />
        </TouchableOpacity>

        <Text
          style={{
            color: COLORS.black,
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 10,
            minWidth: "80%",
            textAlign: "center",
          }}
        >
          Past orders
        </Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No orders available</Text>}
        refreshControl={
          <RefreshControl loading={loading} onRefresh={fetchOrders} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  orderItem: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
  cancelButton: {
    backgroundColor: "#FF4040",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
  },
});

export default OrdersScreen;
