import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url } from "../constants/api";
import { Icons } from "../constants/Icons";

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${base_url}api/v1/orders/${orderId}`,
          { headers }
        );
        console.log(response.data);
        setOrderDetails(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.keyText}>Items</Text>
        <Text style={styles.valueTextBold}>
          {item.quantity} x {item.menu_item}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.centered}>
        <Text>Order details not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.BackIcon />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Order ID:</Text>
        <Text style={styles.valueTextOrange}>{orderDetails.id}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Restaurant Name:</Text>
        <Text style={styles.valueTextBold}>{orderDetails.restaurant_name}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Customer Name:</Text>
        <Text style={styles.valueTextBold}>{orderDetails.customer_name}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Customer Email:</Text>
        <Text style={styles.valueTextBold}>{orderDetails.customer_email}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Estimated Wait Time:</Text>
        <Text style={styles.valueTextBold}>
          {orderDetails.estimated_wait_time} minutes
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Delivery Address:</Text>
        <Text style={styles.valueTextBold}>
          {orderDetails.delivery_address}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Status:</Text>
        <Text style={styles.valueTextBold}>{orderDetails.status}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.keyText}>Total Price:</Text>
        <Text style={styles.valueTextBold}>${orderDetails.total_price}</Text>
      </View>

      <FlatList
        data={orderDetails.order_items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `item-${index}`}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: '5%'
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8
    },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: "80%"
  },
  detailRow: {
    marginBottom: 10,
  },
  keyText: {
    fontSize: 16,
    color: "grey",
  },
  valueTextBold: {
    fontSize: 18,
    fontWeight: "bold",
  },
  valueTextOrange: {
    fontSize: 18,
    color: "orange",
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  flatList: {
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OrderDetailScreen;
