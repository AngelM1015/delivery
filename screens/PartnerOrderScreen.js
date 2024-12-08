import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
  Platform
} from "react-native";
import useOrders from "../hooks/useOrders";
import { Ionicons } from "@expo/vector-icons";
import { base_url } from "../constants/api";

const PartnerOrderScreen = ({ navigation }) => {
  const { loading, partnerOrders, fetchPartnerPendingOrders, deliverOrder, pickUpOrder } =
    useOrders();
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPartnerPendingOrders();
    console.log("in partner order screen");
  }, []);

  const onRefresh = async () => {
    fetchPartnerPendingOrders();
  };

  const redirectToMap = (item) => {
    const latitude = item.address.latitude;
    const longitude = item.address.longitude;
    const label = item.address.location_name;

    const url = Platform.select({
      ios: `maps://?q=${label}&ll=${latitude},${longitude}`,
      android: "geo:" + latitude + "," + longitude + "?q=" + label
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        const browser_url =
          "https://www.google.de/maps/@" +
          latitude +
          "," +
          longitude +
          "?q=" +
          label;
        return Linking.openURL(browser_url);
      }
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.orderId}>Order ID {item.id}</Text>
        {item.status === "partner_assigned" && (
          <View
            style={{
              backgroundColor: "#F09B00",
              padding: 10,
              borderRadius: 24,
            }}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={30}
              color="white"
              onPress={() =>
                navigation.navigate("Chat", {
                  conversationId: item.conversation_id,
                })
              }
            />
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
          style={{ flexDirection: "row", alignItems: "center", marginTop: 15 }}
        >
          <Image
            source={{
              uri: item.image_url
                ? base_url + item.image_url
                : "../assets/images/icon.png",
            }}
            style={{ width: 80, height: 80, borderRadius: 10 }}
          />
          <View style={{ marginLeft: 15, gap: 10 }}>
            <Text style={{ color: "black", fontSize: 20, fontWeight: "bold" }}>
              {item.restaurant_name}
            </Text>
            <Text style={{ color: "black", fontSize: 14 }}>
              {item.order_items
                .map((orderItem) => orderItem.menu_item)
                .join(", ")}
            </Text>
            <Text style={{ color: "#F09B00", fontSize: 14, fontWeight: "400" }}>
              ${item.total_price}
            </Text>
          </View>
        </View>
        <Text style={{ color: "black", fontWeight: "400", fontSize: 12 }}>
          {item.order_items.length} item
        </Text>
      </View>
      <Text>Delivery Address: {item.delivery_address}</Text>
      {item.status === 'picked_up' && (
        <TouchableOpacity
          style={styles.directionButton}
          onPress={() => redirectToMap(item)}
        >
          <Text style={styles.directionText}>Open in Maps</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.pickupButton}
        onPress={item.status === 'partner_assigned' ? (() => pickUpOrder(item.id)) : (() => deliverOrder(item.id))}
      >
        <Text style={styles.pickupButtonText}>{item.status === 'partner_assigned' ? "Pick Order" : "Deliver Order"}</Text>
      </TouchableOpacity>
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
  if (partnerOrders.length === 0)
    return (
      <View style={styles.centered}>
        <Text>No orders available</Text>
      </View>
    );

  return (
    <View style={{ padding: 20, marginTop: 30 }}>
      <Text style={{ alignSelf: "center" }}>Orders</Text>

      <FlatList
        style={{ marginTop: 10 }}
        data={partnerOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl loading={loading} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  orderItem: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    padding: 8,
  },
  orderId: {
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "orange",
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  fab: {
    marginTop: 4,
    position: "absolute",
    right: 10,
    borderRadius: 10,
    padding: 6,
    backgroundColor: "orange",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF4040",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginTop: 20,
    width: "30%",
  },
  directionButton: {
    marginVertical: 4,
    borderRadius: 8,
  },
  directionText: {
    color: "blue",
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'right',
    marginEnd: 4
  },
  pickupButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "orange",
    borderRadius: 8,
    alignItems: "center",
  },
  pickupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
  },
});

export default PartnerOrderScreen;
