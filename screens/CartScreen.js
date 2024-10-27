import React, { useEffect, useState } from 'react';
import { ScrollView, Alert, View, StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';
import { Button, Card, Text, ToggleButton, FAB, Menu, PaperProvider, Icon, Checkbox  } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import Header from '../components/Header';

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
  console.log('cartItems', cartItems);
  const deliveryFee = 5.00; // Example fee
  const discount = 10.00;
  const [orderType, setOrderType] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]); // State to hold payment methods
  const [visible, setVisible] = useState(false);
  // const [discount, setDiscount] = useState(0); // Add discount logic
  // const [extraOptions, setExtraOptions] = useState([]);
  const [extraChecked, setExtraChecked] = useState(false);
  // const [deliveryFee, setDeliveryFee] = useState(null);
  const [displayMessage, setDisplayMessage] = useState("Your cart is empty!");
  const [extraOptions, setExtraOptions] = useState([
    { productName: 'Extra Chess', price: '1$' },
    { productName: 'Extra Vegan Chess', price: '0.15$' },
    { productName: 'Extra Sause', price: '0.5$' },
    { productName: 'Extra Garlic Sause', price: '0.75$' },
  ]);


  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // useEffect(() => {
  //   fetchPaymentMethods(); // Fetch payment methods on load
  // }, []);

  // const fetchPaymentMethods = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');
  //     const response = await axios.get(`${base_url}api/v1/payments/get_payment_methods`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     // Add cash payment option to the fetched payment methods
  //     const cashPaymentOption = {
  //       id: 'cash',
  //       brand: 'Cash',
  //       last4: 'N/A'
  //     };

  //     setPaymentMethods([cashPaymentOption, ...response.data]); // Add cash as the first option
  //   } catch (error) {
  //     console.error('Error fetching payment methods:', error);
  //     Alert.alert('Error', 'Failed to fetch payment methods');
  //   }
  // };

  const incrementQuantity = itemId => {
    const item = cartItems.find(item => item.id === itemId);
    updateItemQuantity(itemId, item.quantity + 1);
  };

  const decrementQuantity = itemId => {
    const item = cartItems.find(item => item.id === itemId);
    updateItemQuantity(itemId, Math.max(item.quantity - 1, 1));
  };

  // const submitOrder = async () => {
  //   if (!orderType || !paymentMethod) {
  //     Alert.alert('Error', 'Please select an order type and payment method');
  //     return;
  //   }

  //   console.log('payment method', paymentMethod)
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');

  //     const storedRestaurantId = await AsyncStorage.getItem('selectedRestaurantId');
  //     if (!storedRestaurantId) {
  //       Alert.alert('Error', 'No associated restaurant found');
  //       return;
  //     }

  //     const orderData = {
  //       order: {
  //         restaurant_id: parseInt(storedRestaurantId),
  //         delivery_address: orderType === 'delivery' ? '209 Aspen Leaf Dr, Big Sky, MT 59716' : '',
  //         total_price: calculateTotalPrice(cartItems),
  //         address_id: 1, // fetch address from customer and then send that address
  //         order_type: orderType,
  //         payment_method: paymentMethod.brand === 'Cash' ? 'cash' : 'other',
  //         order_items_attributes: cartItems.map(item => ({
  //           menu_item_id: item.id,
  //           quantity: item.quantity,
  //           order_item_modifiers_attributes: item.selectedModifiers.map(modifier => ({
  //             modifier_option_id: modifier.modifierId
  //           }))
  //         }))
  //       }
  //     };

  //     const response = await axios.post('http://localhost:3000/api/v1/orders/create_order', {order: orderData.order, payment_method_id: paymentMethod.id}, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     clearCart();
  //     setOrderType(null);
  //     setDisplayMessage('your order has been placed! ✅')
  //   } catch (error) {
  //     console.error('Order submission error:', error.response.data.message);
  //     Alert.alert('Error', error.response.data.message);
  //   }
  // };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateFinalTotal = () => {
    const cartTotal = calculateCartTotal();
    const extrasTotal = extraOptions.reduce((total, option) => total + parseFloat(option.price || 0), 0);
    return cartTotal + extrasTotal + deliveryFee - discount;
  };

  const addExtraOption = () => {
    setExtraOptions([...extraOptions, { productName: '', price: '' }]);
  };

  const updateExtraOption = (index, field, value) => {
    const newOptions = [...extraOptions];
    newOptions[index][field] = value;
    setExtraOptions(newOptions);
  };

  return (
    <PaperProvider>
      <View style={{flex:1}}>
        <View style={{paddingTop:50}}>
          <Header title="About This Menu" navigation={navigation} showShareIcon={true} />
        </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Location Section */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Delivery Location</Text>
          <View style={styles.locationInnerContainer}>
            {/* <Text style={styles.locationAddress}>{deliveryLocation}</Text> */}
            <Button mode="text" onPress={() => setDeliveryLocation('Change Location')}>
              Change Location
            </Button>
          </View>
        </View>

        {/* Cart Items Section */}
        {cartItems.length === 0 ? (
          <Text style={styles.displayMessage}>Your cart is empty!</Text>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <Card key={index} style={styles.cartCard}>
                <View style={styles.cartItemContainer}>
                  <Image source={{ uri: item.imageUrl || '../assets/images/homeImage.png' }} style={styles.cartImage} />
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${item.price}</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity style={styles.quantityIcon} onPress={() => decrementQuantity(item.id)}>
                      <AntDesign name="minus" size={20} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.quantityIcon} onPress={() => incrementQuantity(item.id)}>
                      <AntDesign name="plus" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                        <FontAwesome5 name="trash-alt" size={20} color="red" />
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
                  status={extraChecked ? 'checked' : 'unchecked'}
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
                          style={styles.productInput} // Larger input for product name
                          placeholder={option.productName}
                          value={option.productName}
                          editable={false} // Fixed names as placeholders
                        />
                      </View>
                      <View style={styles.priceInputContainer}>
                        <Text style={styles.inputLabel}>Price</Text>
                        <TextInput
                          style={styles.priceInput} // Smaller input for price
                          placeholder={option.price}
                          keyboardType="numeric"
                          value={option.price}
                          editable={false} // Fixed prices as placeholders
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

              {/* Total Items Row */}
              <View style={styles.summaryRow}>
                <Text>Total Items:</Text>
                <Text style={styles.summaryValue}>${calculateCartTotal().toFixed(2)}</Text>
              </View>

              {/* Delivery Fee Row */}
              <View style={styles.summaryRow}>
                <Text>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>{deliveryFee === 0 || deliveryFee === null ? 'Free' : `$${(deliveryFee || 0).toFixed(2)}`}</Text>
              </View>

              {/* Discount Row */}
              <View style={styles.summaryRow}>
                <Text>Discount:</Text>
                <Text style={styles.summaryValue}>-${discount.toFixed(2)}</Text>
              </View>

              {/* Total Row */}
              <View style={styles.summaryRow}>
                <Text>Total:</Text>
                <Text style={styles.summaryValue}>${calculateFinalTotal().toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Order Now Button */}
      <CustomButton
        text="Order Now"
        onPress={() => {
          if (cartItems.length === 0) {
            navigation.navigate('Home');
          } else {
              navigation.navigate('MenuCheckoutScreen', {
                cartItems,
                orderDetails: {
                  deliveryFee: deliveryFee || 0,
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
     </PaperProvider>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    // paddingBottom: 20,
    // paddingHorizontal: 10,
    padding: 20,
    flex:1,
    // padding:40
  },
  locationContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  locationAddress: {
    fontSize: 16,
  },
  cartCard: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  cartItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  cartItemDetails: {
    flex: 1,
    paddingLeft: 10,
    gap: 8
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#F09B00',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  quantityIcon: {
    borderRadius: '50',
    borderColor: '#C0C0C0',
    borderWidth: '0.5',
    padding: '30'
  },
  extraSection: {
    marginTop: 20,
  },
  addExtraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  extraOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  extraInputContainer: {
    flex: 2, // Make this wider
    marginRight: 10,
  },
  priceInputContainer: {
    flex: 1, // Make this smaller
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
  paymentSummary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.2,
    borderColor: '#C0C0C0'
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryValue: {
    fontWeight: 'bold'
  },
  orderButton: {
    backgroundColor: '#F09B00',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  displayMessage: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'gray',
  },
});

export default CartScreen;
