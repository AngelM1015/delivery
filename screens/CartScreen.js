import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { Card, Text, PaperProvider, Checkbox } from "react-native-paper";
import { useCart } from "../context/CartContext";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";
import CustomButton from "../components/CustomButton";
import Header from "../components/Header";
import Locations from "../components/Locations";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateItemQuantity } = useCart();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [location, setLocation] = useState(null);
  const discount = 0.0;
  const [extraChecked, setExtraChecked] = useState(false);
  const [extraOptions, setExtraOptions] = useState([
    { productName: "Extra Chess", price: "1$" },
    { productName: "Extra Vegan Chess", price: "0.15$" },
    { productName: "Extra Sause", price: "0.5$" },
    { productName: "Extra Garlic Sause", price: "0.75$" },
  ]);

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

  const calculateFinalTotal = () => {
    const cartTotal = calculateCartTotal();
    // const extrasTotal = extraOptions.reduce((total, option) => total + parseFloat(option.price || 0), 0);
    return cartTotal - discount;
  };

  const addExtraOption = () => {
    setExtraOptions([...extraOptions, { productName: "", price: "" }]);
  };

  const updateExtraOption = (index, field, value) => {
    const newOptions = [...extraOptions];
    newOptions[index][field] = value;
    setExtraOptions(newOptions);
  };

  useEffect(() => {
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
  }, []);

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: 50 }}>
          <Header
            title="About This Menu"
            navigation={navigation}
            showShareIcon={true}
          />
        </View>
        <View style={styles.locationContainer}>
          <View style={{ gap: 10 }}>
            <Text style={{ color: "#8F90A6", fontSize: 14 }}>
              {" "}
              Delivery Location
            </Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {selectedLocation
                ? selectedLocation.location_name
                : "Your Location"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            style={styles.changeLocation}
          >
            <Text style={{ color: "#F09B00", textAlign: "center" }}>
              Change Location
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {cartItems.length === 0 ? (
            <View style={{ flexDirection: "column", gap: 25 }}>
              <Image
                source={require("../assets/images/emptyCart.png")}
                style={{ alignSelf: "center", marginVertical: 40 }}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 26,
                  textAlign: "center",
                }}
              >
                {" "}
                Ouch! Hungry
              </Text>
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

              {/* Add Extra Section with Checkbox */}
              <View style={styles.extraSection}>
                <View style={styles.addExtraHeader}>
                  <Checkbox
                    status={extraChecked ? "checked" : "unchecked"}
                    onPress={() => setExtraChecked(!extraChecked)}
                  />
                  <Text style={styles.sectionTitle}>Add Extra</Text>
                </View>

                {/* Extra Input Fields, shown only if checkbox is checked */}
                {extraChecked && (
                  <>
                    {extraOptions.map((option, index) => (
                      <View key={index} style={styles.extraOptionContainer}>
                        <View style={styles.extraInputContainer}>
                          <Text style={styles.inputLabel}>Product Name</Text>
                          <TextInput
                            style={styles.productInput}
                            placeholder={option.productName}
                            value={option.productName}
                            editable={false}
                          />
                        </View>
                        <View style={styles.priceInputContainer}>
                          <Text style={styles.inputLabel}>Price</Text>
                          <TextInput
                            style={styles.priceInput}
                            placeholder={option.price}
                            keyboardType="numeric"
                            value={option.price}
                            editable={false}
                          />
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </View>

              {/* Payment Summary */}
              <View style={styles.paymentSummary}>
                <Text style={styles.summaryText}>Payment Summary</Text>

                <View style={styles.summaryRow}>
                  <Text>Total Items:</Text>
                  <Text style={styles.summaryValue}>
                    ${calculateCartTotal().toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>Discount:</Text>
                  <Text style={styles.summaryValue}>
                    -${discount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>Total:</Text>
                  <Text style={styles.summaryValue}>
                    ${calculateFinalTotal().toFixed(2)}
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
                  totalPrice: calculateFinalTotal(),
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
});

export default CartScreen;
