import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import cable from "../cable";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { base_url } from "../constants/api";

const OngoingOrderScreen = ({ isVisible, onClose, id }) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const route = useRoute();
  const navigation = useNavigation();
  const [order, setOrder] = useState({});
  const [userRole, setUserRole] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [loading, setLoading] = useState(true);

  const getStatusText = (status) => {
    switch (status) {
      case "restaurant_approved":
        return "Preparing Your Order";
      case "partner_assigned":
        return "Driver Assigned";
      case "picked_up":
        return "On The Way";
      case "delivered":
        return "Delivered";
      case "canceled":
        return "Canceled";
      default:
        return (
          status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
          "Processing"
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "restaurant_approved":
        return "#FFA500";
      case "partner_assigned":
        return "#4A89F3";
      case "picked_up":
        return "#4A89F3";
      case "delivered":
        return "#4CAF50";
      case "canceled":
        return "#F44336";
      default:
        return "#888";
    }
  };

  useEffect(() => {
    const fetchOngoingOrder = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role);
      if (!token) {
        Alert.alert("Error", "No token");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${base_url}api/v1/orders/${route.params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const ongoingOrder = response.data;
        console.log("order", response.data);
        setOrder(ongoingOrder);

        if (cable.connection.isOpen()) {
          console.log("WebSocket connection is open.");
        }

        const subscription = await cable.subscriptions.create(
          { channel: "OrderChannel", id: route.params.id },
          {
            received(data) {
              console.log("new order message:", data);
              if (data.partner_message) setPartnerMessage(data.partner_message);
              if (data.customer_message)
                setCustomerMessage(data.customer_message);
              if (data.partner_location)
                setPartnerLocation(data.partner_location);
            },
          },
        );

        setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching ongoing order:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to load order details");
      }
    };

    fetchOngoingOrder();
  }, [route.params.id]);

  const handlePickedUp = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert("Error", "You have been logged out!");
      return;
    }

    try {
      await axios.patch(
        `${base_url}api/v1/orders/${order.id}/pick_up_order`,
        order,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (order.order_type === "pickup") {
        navigation.replace("Main");
      } else {
        Alert.alert("Error", "Something went wrong!");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong!");
    }
  };

  const renderMap = () => {
    if (!order.partner_location && !partnerLocation) return null;
    if (!order.address) return null;

    const partnerCoords = {
      latitude: partnerLocation
        ? partnerLocation.latitude
        : order.partner_location.latitude,
      longitude: partnerLocation
        ? partnerLocation.longitude
        : order.partner_location.longitude,
    };

    const customerCoords = {
      latitude: order.address.latitude,
      longitude: order.address.longitude,
    };

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: partnerCoords.latitude,
            longitude: partnerCoords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker coordinate={partnerCoords} title="Driver Location">
            <View style={styles.markerContainer}>
              <MaterialIcons
                name="delivery-dining"
                size={24}
                style={styles.driverMarker}
              />
            </View>
          </Marker>

          <Marker coordinate={customerCoords} title="Delivery Location">
            <View style={styles.markerContainer}>
              <FontAwesome name="home" size={24} style={styles.homeMarker} />
            </View>
          </Marker>

          <MapViewDirections
            origin={partnerCoords}
            destination={customerCoords}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={6}
            strokeColor="#F09B00"
            lineDashPattern={[0]}
          />
        </MapView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#F09B00" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.orderText}>Order #{order.id}</Text>
          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusBadgeText,
                { color: getStatusColor(order.status) },
              ]}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>

        {order.status === "picked_up" && renderMap()}

        <View style={styles.contentContainer}>
          {order.status === "partner_assigned" ||
          order.status === "picked_up" ? (
            <View style={styles.chatRow}>
              <Text style={styles.chatText}>Chat with your driver</Text>
              <TouchableOpacity
                style={styles.chatIconContainer}
                onPress={() =>
                  navigation.navigate("Chat", {
                    conversationId: order.conversation_id,
                  })
                }
              >
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={30}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.toggleDetailsButton}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.toggleDetailsText}>
              {showDetails ? "Hide Details" : "Show Details"}
            </Text>
            <Ionicons
              name={showDetails ? "chevron-up" : "chevron-down"}
              size={20}
              color="#F09B00"
            />
          </TouchableOpacity>

          {showDetails && (
            <View style={styles.content}>
              {/* Order summary card moved inside details section */}
              <View style={styles.orderSummaryCard}>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>
                    {order.restaurant_name || "Restaurant"}
                  </Text>
                  <Text style={styles.orderItems}>
                    {order.order_items && order.order_items.length > 0
                      ? `${order.order_items.length} item(s)`
                      : "Items being prepared"}
                  </Text>
                </View>
                <Text style={styles.orderPrice}>
                  ${order.total_price || "0.00"}
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {getStatusText(order.status)}
                </Text>
              </View>

              {customerMessage && (
                <View style={styles.messageContainer}>
                  <Text style={styles.detailLabel}>Order message:</Text>
                  <Text style={styles.messageText}>{customerMessage}</Text>
                </View>
              )}

              <View style={styles.estimateContainer}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#F09B00"
                  style={styles.estimateIcon}
                />
                <Text style={styles.estimateText}>
                  Your order will be delivered in {order.estimated_wait_time} -{" "}
                  {order.estimated_wait_time + 15} mins
                </Text>
              </View>

              {order.order_type === "pickup" &&
                order.status === "restaurant_approved" && (
                  <TouchableOpacity
                    style={styles.pickupButton}
                    onPress={() => handlePickedUp()}
                  >
                    <Ionicons
                      name="bag-check-outline"
                      size={24}
                      color="white"
                      style={styles.pickupIcon}
                    />
                    <Text style={styles.pickupButtonText}>
                      Pick Up Your Order
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  orderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F09B00",
    flex: 1,
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
  },
  chatText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  chatIconContainer: {
    backgroundColor: "#F09B00",
    padding: 10,
    borderRadius: 24,
  },
  toggleDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    padding: 8,
  },
  toggleDetailsText: {
    fontSize: 16,
    color: "#F09B00",
    marginRight: 5,
    fontWeight: "500",
  },
  mapContainer: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  driverMarker: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#fff",
    color: "#F09B00",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  homeMarker: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#fff",
    color: "#4A89F3",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  content: {
    marginTop: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  messageContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    fontStyle: "italic",
    marginTop: 4,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F09B00",
  },
  estimateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 8,
  },
  estimateIcon: {
    marginRight: 8,
  },
  estimateText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  pickupButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#F09B00",
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  pickupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  pickupIcon: {
    marginRight: 8,
  },
});

export default OngoingOrderScreen;
