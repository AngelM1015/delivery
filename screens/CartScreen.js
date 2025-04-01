import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Card, Text, PaperProvider } from "react-native-paper";
import { useCart } from "../context/CartContext";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";
import CustomButton from "../components/CustomButton";
import Header from "../components/Header";
import Locations from "../components/Locations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import LottieView from "lottie-react-native";

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateItemQuantity } = useCart();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [location, setLocation] = useState(null);
  const [minOrderFee, setMinOrderFee] = useState(0);

  const discount = 0.0;

  const handleSelectLocation = (location) => {
    console.log("location", location);
    setSelectedLocation(location);
    setLocationModalVisible(false);
  };

  const incrementQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    updateItemQuantity(itemId, item.quantity + 1);
  };

  const decrementQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    updateItemQuantity(itemId, Math.max(item.quantity - 1, 1));
  };

  const calculateCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateMinimumOrderFee = (cartTotal) => {
    const calculatedFee = (cartTotal * 0.2).toFixed(2) < 8.0 ? (8 - cartTotal * 0.2) : 0.0;
    return parseFloat(calculatedFee.toFixed(2));
  };

  const calculateFinalTotal = (cartTotal, minimumOrderFee) => {
    return cartTotal - discount + minimumOrderFee;
  };

  useEffect(() => {
    const cartTotal = calculateCartTotal();
    const minimumOrderFee = calculateMinimumOrderFee(cartTotal);
    setMinOrderFee(minimumOrderFee);
  }, [cartItems]);

  const finalTotal = calculateFinalTotal(calculateCartTotal(), minOrderFee);

  useFocusEffect(
    React.useCallback(() => {
      const getLocation = async () => {
        try {
          const location = await AsyncStorage.getItem("location");
          if (location) {
            const parsedLocation = JSON.parse(location);
            setLocation(parsedLocation);
            setSelectedLocation(parsedLocation);
          }
        } catch (error) {
          console.log("Error fetching location:", error);
        }
      };

      getLocation();
    }, [])
  );

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: 50 }}>
        <Header
      title="Your Cart"
      navigation={navigation}
      showBackIcon={true}
      showShareIcon={true}
    />
        </View>
        <View style={styles.locationContainer}>
          <View style={{ gap: 10 }}>
            <Text style={{ color: "#8F90A6", fontSize: 14 }}>
              {" "}
              Delivery Location
            </Text>
            {selectedLocation &&
              <Text style={styles.locationText} numberOfLines={2}>
                {selectedLocation.location_name}
              </Text>
            }
          </View>
          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            style={styles.changeLocation}
          >
            <Text style={{ color: "#F09B00", textAlign: "center" }}>
              {selectedLocation ? 'Change Location' : 'Add Location'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <View style={styles.lottieContainer}>
                {/* <Image
                  source={require("../assets/images/emptyCart.png")}
                  style={{ alignSelf: "center", marginVertical: 40 }}
                /> */}
                <LottieView
                  source={require("../assets/lottie-images/404-Error.json")}
                  style={styles.lottieAnimation}
                  autoPlay
                  speed={0.5} // Slightly slower than normal (1.0)
                />
              </View>
              <Text style={styles.emptyCartTitle}>Ouch! Hungry</Text>
              <Text style={styles.displayMessage}>
                Seems like you have not ordered any food yet
              </Text>
            </View>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <Card key={index} style={styles.cartCard}>
                  <View style={styles.cartItemContainer}>
                    <Image
                      source={{
                        uri: item.imageUrl || "../assets/images/homeImage.png",
                      }}
                      style={styles.cartImage}
                    />
                    <View style={styles.cartItemDetails}>
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.price}</Text>
                      <View style={styles.quantityControls}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <TouchableOpacity
                            style={styles.quantityIcon}
                            onPress={() => decrementQuantity(item.id)}
                          >
                            <AntDesign name="minus" size={20} />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            style={styles.quantityIcon}
                            onPress={() => incrementQuantity(item.id)}
                          >
                            <AntDesign name="plus" size={20} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeFromCart(index)}
                        >
                          <FontAwesome5
                            name="trash-alt"
                            size={20}
                            color="red"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}

              {/* Payment Summary */}
              <View style={styles.paymentSummary}>
                <Text style={styles.summaryText}>Payment Summary</Text>

                <View style={styles.summaryRow}>
                  <Text>Total Items:</Text>
                  <Text style={styles.summaryValue}>
                    ${calculateCartTotal().toFixed(2)}
                  </Text>
                </View>
                {minOrderFee > 0 && (
                  <View style={styles.summaryRow}>
                    <Text>Small Order Fee:</Text>
                    <Text style={styles.summaryValue}>
                      +${minOrderFee}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <Text>Discount:</Text>
                  <Text style={styles.summaryValue}>
                    -${discount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>Total:</Text>
                  <Text style={styles.summaryValue}>
                    ${finalTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Order Now Button */}
        <CustomButton
          text={cartItems.length === 0 ? "Find Food" : "Order Now"}
          onPress={() => {
            if (cartItems.length === 0) {
              navigation.navigate("Home");
            } else {
              navigation.navigate("MenuCheckoutScreen", {
                orderDetails: {
                  deliveryFee: 0,
                  discount: discount || 0,
                  totalPrice: finalTotal,
                  imageUrl: cartItems[0].imageUrl,
                  itemName: cartItems[0].name,
                  itemPrice: cartItems[0].price,
                  quantity: cartItems[0].quantity,
                },
              });
            }
          }}
        />
      </View>
      <Locations
        isVisible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelectLocation={handleSelectLocation}
      />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 15,
  },
  locationContainer: {
    marginHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "12%",
  },
  locationText: {
    fontSize: 16,
    marginStart: 4,
    maxWidth: "60%",
    fontWeight: "bold",
  },
  changeLocation: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 16,
    height: "50%",
    marginEnd: 4,
  },
  cartCard: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowOpacity: 0,
  },
  cartItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cartImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  cartItemDetails: {
    flex: 1,
    paddingLeft: 10,
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 14,
    color: "#F09B00",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
    gap: 5,
  },
  quantityText: {
    margin: "auto",
    fontSize: 16,
  },
  quantityIcon: {
    borderRadius: 4,
    borderColor: "#C0C0C0",
    borderWidth: 0.5,
    padding: 2,
  },
  extraSection: {
    marginTop: 20,
  },
  addExtraHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  extraOptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  extraInputContainer: {
    flex: 2,
    marginRight: 10,
  },
  priceInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
  },
  paymentSummary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 0.2,
    borderColor: "#C0C0C0",
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryValue: {
    fontWeight: "bold",
  },
  orderButton: {
    backgroundColor: "#F09B00",
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  displayMessage: {
    textAlign: "center",
    margin: "auto",
    fontSize: 16,
    color: "gray",
    maxWidth: "70%",
  },
  // New styles for the empty cart and Lottie animation
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 25,
  },
  lottieContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  emptyCartTitle: {
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    color: '#333',
  },
});

export default CartScreen;
