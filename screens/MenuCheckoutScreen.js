import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import CustomButton from "../components/CustomButton";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { base_url } from "../constants/api";
import useOrder from "../hooks/useOrder";
import PaymentMethod from "../components/PaymentMethod";
import { FontAwesome } from "@expo/vector-icons";
import useUser from "../hooks/useUser";
import { useCart } from "../context/CartContext";
import client from "../client";

const MenuCheckoutScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems } = useCart();
  const { createOrder } = useOrder();
  const { userName } = useUser();
  const { orderDetails = {} } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [orderType, setOrderType] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [restaurantDelivery, setRestaurantDelivery] = useState({})
  const [address, setAddress] = useState({
    id: 0,
    location_name: "",
    latitude: 0,
    longitude: 0,
  });
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);

  const deliveryDetails = {
    name: userName,
    phone: "+12 8347 2838 28",
    address: address.location_name,
  };

  useEffect(() => {
    if(!cartItems.length > 0) navigation.goBack();

    fetchPaymentMethods();

    const getLocation = async () => {
      try {
        const location = await AsyncStorage.getItem("location");
        if (location) {
          const parsedLocation = JSON.parse(location);
          setAddress(parsedLocation);
        }
      } catch (error) {
        console.log("Error fetching location:", error);
      }
    };
    getLocation();
  }, [cartItems]);

  useEffect(() => {
    if( address.location_name !== "") calculateDistance(address);
  }, [address])

  const calculateDistance = async (location) => {
    const token = AsyncStorage.getItem('userToken');
    const restaurantId = await AsyncStorage.getItem("selectedRestaurantId");
    const url = `api/v1/restaurants/${restaurantId}/delivery_mileage`
    const restaurant = {
      destination_latitude: location.latitude,
      destination_longitude: location.longitude
    }

    try {
      const response = await client.get(url,
        { params: {
          restaurant
        },
          Header: { Authorization: `Bearer ${token}` }
        }
      )
      console.log('distance response', response.data);

      setRestaurantDelivery(response.data)
    } catch (error) {
        console.error("Error fetching distance:", error);
        return;
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${base_url}api/v1/payments/get_payment_methods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to fetch payment methods");
    }
  };

  const orderTypeSelection = (value) => {
    console.log("value of order type", value);
    if (value === "delivery") {
      setDeliveryFee(restaurantDelivery.delivery_price);
    } else {
      setDeliveryFee(0);
    }
    setOrderType(value);
  };

  const submitOrder = async () => {
    if (!orderType || paymentMethod.length < 1) {
      Alert.alert("Error", "Please select an order type and payment method");
      return;
    }

    if (orderType === "delivery" && deliveryDetails.address === "") {
      Alert.alert("Error", "Please add delivery address");
      return;
    }

    console.log("payment method", paymentMethod);

    const storedRestaurantId = await AsyncStorage.getItem("selectedRestaurantId");
    if (!storedRestaurantId) {
      Alert.alert("Error", "No associated restaurant found");
      return;
    }

    const orderData = {
      order: {
        restaurant_id: storedRestaurantId,
        delivery_address:
          orderType === "delivery"
            ? address.location_name
            : "",
        total_price: orderDetails.totalPrice + deliveryFee,
        delivery_fee: deliveryFee,
        payment_method_id: paymentMethod.id,
        address_id: address.id,
        order_type: orderType,
        delivery_mileage: restaurantDelivery.distance,
        order_items_attributes: cartItems.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          order_item_modifiers_attributes: item.selectedModifiers.map(
            (modifier) => ({
              modifier_id: modifier.modifierId,
              order_modifier_options_attributes: modifier.options.map(
                (modifier_option) => ({
                  modifier_option_id: modifier_option.id
                })
              )
            })
          ),
        })),
      },
    };

    route.params;

    setIsLoading(true);
    try {
      await createOrder(navigation, orderData.order);
    } catch (error) {
      Alert.alert("Error", "Failed to create order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFA500" />
            <Text style={styles.loadingText}>Placing your order...</Text>
          </View>
        )}
      <View style={styles.headerContainer}>
        <Header title="Checkout" navigation={navigation} showShareIcon={true} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtext}>You deserve better meal</Text>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Items Ordered</Text>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.name || "Unknown Item"}
                  </Text>
                  <Text style={styles.itemPrice}>${item.price || "0.00"}</Text>
                </View>
                <Text style={styles.itemQuantity}>
                  {item.quantity || 1} items
                </Text>
              </View>
            ))
          ) : (
            <Text>No items in cart</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Details Transaction</Text>
          <View style={styles.transactionDetails}>
            <View style={styles.transactionRow}>
              <Text style={styles.detailText}>Cherry Healthy</Text>
              <Text style={styles.detailAmount}>
                ${orderDetails.cherryHealthyPrice || "0.00"}
              </Text>
            </View>
            {deliveryFee > 0 && (
              <View style={styles.transactionRow}>
                <Text style={styles.detailText}>Driver</Text>
                <Text style={styles.detailAmount}>$20.00</Text>
              </View>
            )}

            <View style={styles.transactionRow}>
              <Text style={styles.detailText}>Tax 10%</Text>
              <Text style={styles.detailAmount}>
                ${orderDetails.tax || "0.00"}
              </Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.totalText}>Total Price</Text>
              <Text style={styles.totalAmount}>
                ${orderDetails.totalPrice + deliveryFee || "0.00"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.subHeader}>Deliver to :</Text>
          <View style={styles.deliverySection}>
            {Object.entries(deliveryDetails).map(([label, value], index) => (
              <View key={index} style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}:
                </Text>
                <Text style={styles.deliveryDetail}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.separator} />

        {/* Order Type Selection */}
        <Text style={{ fontSize: 18, marginBottom: 8, fontWeight: "bold" }}>
          Select delivery or pickup
        </Text>
        <View style={styles.orderTypeContainer}>
          <View style={styles.orderTypeWrapper}>
            <TouchableOpacity
              style={[
                styles.orderType,
                orderType === "delivery" && styles.selectedOrderType,
              ]}
              onPress={() => orderTypeSelection("delivery")}
            >
              <Image
                source={require("../assets/images/delivery.png")}
                style={{ height: 50, width: 50 }}
              />
              <Text>delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderType,
                orderType === "pickup" && styles.selectedOrderType,
              ]}
              onPress={() => orderTypeSelection("pickup")}
            >
              <Image
                source={require("../assets/images/take-away.png")}
                style={{ height: 50, width: 50 }}
              />
              <Text>pickup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method Section */}
        {orderType !== null && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Payment Method</Text>
            <TouchableOpacity
              style={styles.paymentSelector}
              onPress={() => setShowPaymentMethodsModal(true)}
              disabled={orderType === null}
            >
              {paymentMethod.id ? (
                <>
                  <Text style={styles.selectedPaymentMethod}>
                    {paymentMethod.brand} **** {paymentMethod.last4}
                  </Text>
                  <FontAwesome
                    name={"cc-" + paymentMethod.brand.toLowerCase()}
                    size={24}
                    color="black"
                  />
                </>
              ) : (
                <Text>Select Payment Method</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <PaymentMethod
          visible={showPaymentMethodsModal}
          onClose={() => setShowPaymentMethodsModal(false)}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={paymentMethod}
          onSelect={(method) => {
            setPaymentMethod(method);
            setShowPaymentMethodsModal(false);
          }}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            text="Checkout Now"
            onPress={() => {
              submitOrder();
            }}
            disable={orderType === null && paymentMethod.length === 0}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingTop: 50,
  },
  scrollContent: {
    padding: 20,
  },
  subtext: {
    textAlign: "center",
    fontSize: 16,
    color: "#a0a0a0",
    marginVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: "#FFF",
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  separator: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: "#F09B00",
    marginTop: 15,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  transactionDetails: {
    fontSize: 14,
    paddingBottom: 0,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic"
  },
  detailAmount: {
    fontSize: 16,
    color: "#000",
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 18,
    fontStyle: "italic"
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#F09B00",
  },
  deliverySection: {
    marginTop: 10,
  },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontStyle: "italic"
  },
  deliveryDetail: {
    fontSize: 16,
    color: "#666",
    maxWidth: "50%",
    textAlign: "right",
  },
  selectedOrderType: {
    borderColor: "#F09B00",
  },
  buttonContainer: {
    marginTop: 20,
  },
  expandText: {
    fontSize: 16,
    color: "#888",
  },
  paymentMethodItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  paymentSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 10,
  },
  selectedPaymentMethod: {
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentMethodText: {
    fontSize: 16,
  },
  orderTypeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    margin: 10,
  },
  orderTypeWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  orderTypeGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  orderTypeItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  orderTypeLabel: {
    marginTop: 5,
    fontSize: 12,
  },
  orderType: {
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 14
  },
});

export default MenuCheckoutScreen;
