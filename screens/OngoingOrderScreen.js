import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  TouchableOpacity,
  SafeAreaView,
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
  const [showDetails, setShowDetails] = useState(false); // State to toggle order details

  useEffect(() => {
    const fetchOngoingOrder = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role);
      if (!token) {
        Alert.alert("Error", "No token");
        return;
      }

      try {
        const response = await axios.get(
          `${base_url}api/v1/orders/${route.params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching ongoing order:", error);
      }
    };

    fetchOngoingOrder();
  }, [route.params.id]);

  const handlePickedUp = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert("Error", "you have been logged out!");
      return;
    }

    try {
      await axios.patch(
        `${base_url}api/v1/orders/${order.id}/pick_up_order`,
        order,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (order.order_type === "pickup") {
        navigation.replace("Main");
      } else {
        Alert.alert("Error", "something went wrong!");
      }
    } catch (error) {
      Alert.alert("Error", "something went wrong!");
    }
  };

  const renderMap = () => {
    if (!order.partner_location || !order.address) return null;

    const partnerCoords = {
      latitude: order.partner_location.latitude,
      longitude: order.partner_location.longitude,
    };

    const customerCoords = {
      latitude: order.address.latitude,
      longitude: order.address.longitude,
    };

    return (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: partnerCoords.latitude,
          longitude: partnerCoords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={partnerCoords} title="Partner Location">
          <MaterialIcons
            name="delivery-dining"
            size={24}
            style={{
              padding: 4,
              borderRadius: 20,
              backgroundColor: "#fff",
              color: "red",
            }}
          />
        </Marker>

        <Marker coordinate={customerCoords} title="Customer Location">
          <FontAwesome
            name="home"
            size={24}
            style={{
              padding: 4,
              borderRadius: 20,
              backgroundColor: "#fff",
              color: "red",
            }}
          />
        </Marker>

        <MapViewDirections
          origin={partnerCoords}
          destination={customerCoords}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={6}
          strokeColor="blue"
        />
      </MapView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        {order.status === "picked_up" && (
          <View style={styles.mapContainer}>{renderMap()}</View>
        )}

        <View style={styles.header}>
          {/* <Text style={styles.title}>Order Details</Text> */}
          <Text style={styles.orderText}>Order Id #{order.id}</Text>
          {order.status === "partner_assigned" ||
            (order.status === "picked_up" && (
              <View style={styles.chatRow}>
                <Text style={styles.chatText}>Chat with your rider</Text>
                <View style={styles.chatIconContainer}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={30}
                    color="white"
                    onPress={() =>
                      navigation.navigate("Chat", {
                        conversationId: order.conversation_id,
                      })
                    }
                  />
                </View>
              </View>
            ))}
          <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
            <Text style={styles.toggleDetailsText}>
              {showDetails ? "Hide Details" : "Show Details"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDetails && (
          <View style={styles.content}>
            <Text>Status: {order.status}</Text>
            <Text>Order message: {customerMessage}</Text>
            <Text>
              Your order will be delivered in {order.estimated_wait_time} -{" "}
              {order.estimated_wait_time + 15} mins
            </Text>

            {order.order_type === "pickup" &&
              order.status === "restaurant_approved" && (
                <TouchableOpacity
                  style={styles.pickupButton}
                  onPress={() => handlePickedUp()}
                >
                  <Text style={styles.pickupButtonText}>Pick Your Order</Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
  },
  header: {
    flexDirection: "column",
    paddingHorizontal: 14,
    marginTop: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleDetailsText: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
  },
  content: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  orderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F09B00",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatText: {
    fontSize: 24,
    color: "grey",
    fontStyle: "italic",
  },
  chatIconContainer: {
    backgroundColor: "#F09B00",
    padding: 10,
    borderRadius: 24,
  },
  pickupButton: {
    marginTop: 40,
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
  map: {
    width: "100%",
    height: 600,
  },
});

export default OngoingOrderScreen;
