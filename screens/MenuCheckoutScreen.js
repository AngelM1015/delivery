import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Linking,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import * as Location from "expo-location";
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

// Increase the timeout for distance calculations
client.defaults.timeout = 30000; // 30 seconds timeout

const MenuCheckoutScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems, cartRestaurantId } = useCart();
  const { createOrder } = useOrder();
  const { userName } = useUser();
  const [paymentMethod, setPaymentMethod] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [orderType, setOrderType] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0.0);
  const [restaurantDelivery, setRestaurantDelivery] = useState({});
  const [surgeFee, setSurgeFee] = useState({
    total: 0.0,
    driver: 0.0,
    restaurant: 0.0,
  });
  const [retryOrderData, setRetryOrderData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const subTotal = cartItems.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
    0,
  );
  const bigSkyTax = subTotal * 0.04;
  const totalPrice = subTotal + bigSkyTax + parseFloat(deliveryFee || 0) + parseFloat(surgeFee.total || 0);

  const [address, setAddress] = useState({
    id: 0,
    location_name: "",
    latitude: 0,
    longitude: 0,
  });
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);

  const [isFeatureTypeSelected, setIsFeatureTypeSelected] = useState(false);

  const deliveryDetails = {
    name: userName,
    phone: "+12 8347 2838 28",
    address: address.location_name,
  };

  // Add this function at the top of your component
  const getRestaurantId = async () => {
    try {
      // Try all possible sources for restaurant ID
      let restaurantId = await AsyncStorage.getItem("selectedRestaurantId");

      if (!restaurantId) {
        restaurantId = await AsyncStorage.getItem("restaurantId");
      }

      // If still not found, try to get from cart items
      if (!restaurantId && cartItems && cartItems.length > 0) {
        const firstItem = cartItems[0];
        if (firstItem.restaurantId) {
          restaurantId = firstItem.restaurantId.toString();
          // Save it for future use
          await AsyncStorage.setItem("selectedRestaurantId", restaurantId);
        }
      }

      return restaurantId;
    } catch (error) {
      console.error("Error retrieving restaurant ID:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!cartItems.length > 0) navigation.goBack();

    const checkRestaurantId = async () => {
      const id = await getRestaurantId();

      if (!id && cartItems.length > 0 && cartItems[0].restaurantId) {
        await AsyncStorage.setItem(
          "selectedRestaurantId",
          cartItems[0].restaurantId.toString(),
        );
      }
    };

    checkRestaurantId();
    fetchPaymentMethods();

    const getLocation = async () => {
      try {
        const location = await AsyncStorage.getItem("location");
        if (location) {
          const parsedLocation = JSON.parse(location);
          setAddress(parsedLocation);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    getLocation();
  }, [cartItems]);

  useEffect(() => {
    if (address.location_name !== "") calculateDistance(address);
  }, [address]);

  // Recalculate total when surge fee changes
  useEffect(() => {
  }, [surgeFee]);

  const calculateDistance = async (location) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const restaurantId = await getRestaurantId();

      if (!restaurantId) {
        console.error("No restaurant ID available for distance calculation");
        return;
      }

      const url = `api/v1/restaurants/${restaurantId}/delivery_mileage`;
      const restaurant = {
        destination_latitude: location.latitude,
        destination_longitude: location.longitude,
      };

      const response = await client.get(url, {
        params: {
          restaurant,
        },
        Header: { Authorization: `Bearer ${token}` },
      });

      setRestaurantDelivery(response.data);
    } catch (error) {
      console.error("Error fetching distance:", error);
      return;
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${base_url}api/v1/payments/get_payment_methods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to fetch payment methods");
    }
  };

  const fetchSurgeFee = async (restaurantId, addressId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${base_url}api/v1/orders/surge_fee`,
        {
          params: {
            restaurant_id: restaurantId,
            address_id: addressId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        if (response.data.delivery_fee && typeof response.data.delivery_fee.total_fee === 'number') {
          setDeliveryFee(response.data.delivery_fee.total_fee);
        } else {
          setDeliveryFee(0);
        }
        if (response.data.surge_fee && response.data.surge_fee.table && typeof response.data.surge_fee.table.total === 'number') {
          setSurgeFee(response.data.surge_fee.table);
        } else {
          setSurgeFee({
            total: 0.0,
            driver: 0.0,
            restaurant: 0.0,
          });
        }
      } else {
        setDeliveryFee(0);
        setSurgeFee({
          total: 0.0,
          driver: 0.0,
          restaurant: 0.0,
        });
      }
    } catch (error) {
      setDeliveryFee(0);
      setSurgeFee({
        total: 0.0,
        driver: 0.0,
        restaurant: 0.0,
      });
      console.error("Error fetching surge fee:", error);
    }
  };

  const orderTypeSelection = async (value) => {
    if (value === "delivery") {
      if(address.location_name === "") {
        Alert.alert("Address Required", "Please add a delivery address");
        return;
      }
      const restaurantId = await getRestaurantId();
      if (restaurantId && address.id) {
        fetchSurgeFee(restaurantId, address.id);
      } else {
        setDeliveryFee(0);
        setSurgeFee({
          total: 0.0,
          driver: 0.0,
          restaurant: 0.0,
        });
      }
    } else {
      setDeliveryFee(0);
      setSurgeFee({
        total: 0.0,
        driver: 0.0,
        restaurant: 0.0,
      });
    }
    setOrderType(value);
  };

  const requestLocationPermissions = async () => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== "granted") {
      Alert.alert(
        "Permission Denied",
        "You need to grant location permissions to place an order.",
      );
      return;
    }

    // Then in your function:
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      Alert.alert(
        "Background Location Required",
        "To find drivers while you're not using the app, please set to [Always] background location must be granted.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              // This will open the app settings on iOS or app details on Android
              Linking.openSettings();
            },
          },
        ],
      );
      return;
    }
  };

  const submitOrder = async () => {
    try {
      // Validate order requirements
      if (!orderType) {
        Alert.alert(
          "Missing Information",
          "Please select an order type (delivery or pickup)",
        );
        return;
      }

      if (!paymentMethod || !paymentMethod.id) {
        Alert.alert("Payment Required", "Please select a valid payment method");
        return;
      }

      // Get restaurant ID using our helper function
      const restaurantId = await getRestaurantId();

      if (!restaurantId) {
        Alert.alert(
          "Restaurant Not Found",
          "We couldn't identify which restaurant you're ordering from. Please try selecting a restaurant again.",
        );
        return;
      }

      // Validate delivery-specific requirements
      if (orderType === "delivery") {
        if (!address || !address.location_name) {
          Alert.alert("Address Required", "Please add a delivery address");
          return;
        }

        if (!deliveryFee || deliveryFee <= 0) {
          Alert.alert(
            "Delivery Fee Error",
            "A delivery fee could not be calculated. Please ensure your address is correct and try again.",
          );
          return;
        }

        // Check location permissions for delivery tracking
        try {
          const { status: foregroundStatus } =
            await Location.getForegroundPermissionsAsync();
          const { status: backgroundStatus } =
            await Location.getBackgroundPermissionsAsync();

          if (
            foregroundStatus !== "granted" ||
            backgroundStatus !== "granted"
          ) {
            Alert.alert(
              "Location Permission Required",
              "To find drivers while you're not using the app, background location must be granted.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Enable Location",
                  onPress: requestLocationPermissions,
                },
              ],
            );
            return;
          }
        } catch (locationError) {
          console.error("Error checking location permissions:", locationError);
          Alert.alert(
            "Location Services Error",
            "There was a problem accessing location services. Please check your device settings.",
          );
          return;
        }
      }

      // Prepare order data
      const orderData = {
        order: {
          restaurant_id: parseInt(restaurantId),
          delivery_address:
            orderType === "delivery" ? address.location_name : "",
          total_price: totalPrice.toFixed(2),
          surge_fee: parseFloat(surgeFee.total || 0).toFixed(2),
          driver_surge_share: parseFloat(surgeFee.driver_share || 0).toFixed(2),
          restaurant_surge_share: parseFloat(surgeFee.restaurant_share || 0).toFixed(2),
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
                    modifier_option_id: modifier_option.id,
                  }),
                ),
              }),
            ),
          })),
        },
      };

      setRetryOrderData(orderData.order);
      setRetryCount(0);
      await executeOrderSubmission(orderData.order);
    } catch (error) {
      console.error("Order submission error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const executeOrderSubmission = async (orderData, isRetry = false) => {
    setIsLoading(true);

    // Define callback to handle surge fee updates
    const handleSurgeFeeUpdate = (expectedSurgeFee) => {

      // Update the surge fee with the expected value from backend
      setSurgeFee(prevState => ({
        ...prevState,
        total: parseFloat(expectedSurgeFee),
      }));

      if (isRetry && retryCount < MAX_RETRIES) {
        // Auto-retry with updated surge fee
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          executeOrderSubmission(orderData, true);
        }, 1000); // Wait 1 second before retry
      } else if (isRetry && retryCount >= MAX_RETRIES) {
        Alert.alert(
          "Maximum Retries Reached",
          "We've tried to update the pricing multiple times but encountered issues. Please try again later.",
          [
            {
              text: "OK",
              onPress: () => {
                setRetryCount(0);
                setRetryOrderData(null);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Pricing Updated",
          `The delivery pricing has been updated. Please review the new total and try placing your order again.`,
          [
            {
              text: "OK",
              onPress: () => {
                // The user can try submitting again with the updated surge fee
              }
            }
          ]
        );
      }
    };

    try {
      await createOrder(navigation, orderData, handleSurgeFeeUpdate);
      // If successful, reset retry state
      setRetryCount(0);
      setRetryOrderData(null);
    } catch (error) {
      console.error("Order creation error:", error);
      if (!isRetry) {
        Alert.alert("Error", "Failed to create order. Please try again.");
      }
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
                  <Text style={styles.itemPrice}>
                    ${parseFloat(item.price || 0).toFixed(2)}
                  </Text>
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
              <Text style={styles.detailText}>Big Sky Tax 4%</Text>
              <Text style={styles.detailAmount}>${bigSkyTax.toFixed(2)}</Text>
            </View>
            {deliveryFee > 0 && (
              <View style={styles.transactionRow}>
                <Text style={styles.detailText}>Driver</Text>
                <Text style={styles.detailAmount}>
                  ${parseFloat(deliveryFee).toFixed(2)}
                </Text>
              </View>
            )}
            {surgeFee.total > 0 && (
              <View style={styles.transactionRow}>
                <Text style={styles.detailText}>Surge Fee</Text>
                <Text style={styles.detailAmount}>${parseFloat(surgeFee.total).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.transactionRow}>
              <Text style={styles.totalText}>Total Price</Text>
              <Text style={styles.totalAmount}>
                ${totalPrice.toFixed(2)}
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
              onPress={() => {
                orderTypeSelection("delivery");
                setIsFeatureTypeSelected(true);
              }}
            >
              <LottieView
                source={require("./../assets/lottie-images/Order-On-The-Way.json")}
                autoPlay={orderType === "delivery"}
                loop={false}
                style={{ height: 120, width: 120 }}
              />
              <Text>DELIVERY ORDER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.orderType,
                orderType === "pickup" && styles.selectedOrderType,
              ]}
              onPress={() => {
                orderTypeSelection("pickup");
                setIsFeatureTypeSelected(true);
              }}
            >
              <LottieView
                source={require("./../assets/lottie-images/Ready-Food-Order.json")}
                autoPlay={orderType === "pickup"}
                loop={false}
                style={{ height: 120, width: 120 }}
              />
              <Text>PICK-UP ORDER</Text>
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
          {retryCount > 0 && retryCount < MAX_RETRIES && (
            <Text style={styles.retryText}>
              Updating pricing... (Attempt {retryCount}/{MAX_RETRIES})
            </Text>
          )}

          {retryCount >= MAX_RETRIES && retryOrderData && (
            <View style={styles.retryContainer}>
              <Text style={styles.retryText}>
                Maximum retries reached. Please try again.
              </Text>
              <CustomButton
                text="Retry Order"
                onPress={() => {
                  setRetryCount(0);
                  executeOrderSubmission(retryOrderData, false);
                }}
                style={styles.retryButton}
              />
            </View>
          )}

          <CustomButton
            text="Checkout Now"
            onPress={() => {
              submitOrder();
            }}
            disable={orderType === null || !paymentMethod.id || isLoading}
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
    fontStyle: "italic",
  },
  detailAmount: {
    fontSize: 16,
    color: "#000",
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 18,
    fontStyle: "italic",
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
    fontStyle: "italic",
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
    marginBottom: 14,
  },
  retryText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  retryContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  retryButton: {
    marginTop: 10,
  },
});

export default MenuCheckoutScreen;
