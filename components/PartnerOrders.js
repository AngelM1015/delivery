import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { base_url } from "../constants/api";

const PartnerOrders = ({ visible, onRequestClose, orders }) => {
  const [partnerOrders, setPartnerOrders] = useState([]);

  useEffect(() => {
    setPartnerOrders(orders);
  }, [visible]);

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

    return (
      <View key={order.id} style={styles.orderCard}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.orderTitle}>Order #{order.id}</Text>
          <View
            style={{
              backgroundColor: "#f0f0f0",
              padding: 10,
              borderRadius: 16,
              width: "30%",
            }}
          >
            <Text style={{ color: statusColor, textAlign: "center" }}>
              {" "}
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
                uri: order.image_url
                  ? base_url + order.image_url
                  : "../assets/images/icon.png",
              }}
              style={{ width: 80, height: 80, borderRadius: 10 }}
            />
            <View style={{ marginLeft: 15, gap: 10 }}>
              <Text
                style={{ color: "black", fontSize: 20, fontWeight: "bold" }}
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
          <Text style={{ color: "black", fontWeight: "400", fontSize: 12 }}>
            {order.order_items.length} item
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={() => onRequestClose()}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onRequestClose()}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.heading}> Orders </Text>
        </View>

        <ScrollView contentContainerStyle={styles.orderListContainer}>
          <FlatList
            data={partnerOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text>No orders available</Text>}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    gap: 100,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 24,
    paddingTop: 10,
  },
  orderCard: {
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
    color: "#FFA500",
    fontWeight: "bold",
  },
  closeButton: {
    alignSelf: "flex-start",
    marginLeft: 20,
    backgroundColor: "#FFA500",
    borderRadius: 15,
    padding: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PartnerOrders;
