import React, { useEffect, useState } from 'react';
import { ScrollView, Alert, View, StyleSheet } from 'react-native';
import { Button, Card, Text, ToggleButton, FAB, Menu, PaperProvider, Icon } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const [orderType, setOrderType] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]); // State to hold payment methods
  const [visible, setVisible] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [displayMessage, setDisplayMessage] = useState("Your cart is empty!");

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  useEffect(() => {
    fetchPaymentMethods(); // Fetch payment methods on load
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://localhost:3000/api/v1/payments/get_payment_methods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Add cash payment option to the fetched payment methods
      const cashPaymentOption = {
        id: 'cash',
        brand: 'Cash',
        last4: 'N/A'
      };

      setPaymentMethods([cashPaymentOption, ...response.data]); // Add cash as the first option
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to fetch payment methods');
    }
  };

  const incrementQuantity = itemId => {
    const item = cartItems.find(item => item.id === itemId);
    updateItemQuantity(itemId, item.quantity + 1);
  };

  const decrementQuantity = itemId => {
    const item = cartItems.find(item => item.id === itemId);
    updateItemQuantity(itemId, Math.max(item.quantity - 1, 1));
  };

  const submitOrder = async () => {
    if (!orderType || !paymentMethod) {
      Alert.alert('Error', 'Please select an order type and payment method');
      return;
    }

    console.log('payment method', paymentMethod)
    try {
      const token = await AsyncStorage.getItem('userToken');

      const storedRestaurantId = await AsyncStorage.getItem('selectedRestaurantId');
      if (!storedRestaurantId) {
        Alert.alert('Error', 'No associated restaurant found');
        return;
      }

      const orderData = {
        order: {
          restaurant_id: parseInt(storedRestaurantId),
          delivery_address: orderType === 'delivery' ? '209 Aspen Leaf Dr, Big Sky, MT 59716' : '',
          total_price: calculateTotalPrice(cartItems),
          address_id: 1, // fetch address from customer and then send that address
          order_type: orderType,
          payment_method: paymentMethod.brand === 'Cash' ? 'cash' : 'other',
          order_items_attributes: cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            order_item_modifiers_attributes: item.selectedModifiers.map(modifier => ({
              modifier_option_id: modifier.modifierId
            }))
          }))
        }
      };

      const response = await axios.post('http://localhost:3000/api/v1/orders/create_order', {order: orderData.order, payment_method_id: paymentMethod.id}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      clearCart();
      setOrderType(null);
      setDisplayMessage('your order has been placed! ✅')
    } catch (error) {
      console.error('Order submission error:', error.response.data.message);
      Alert.alert('Error', error.response.data.message);
    }
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + item.price, 0) + deliveryFee;
  };

  return (
    <PaperProvider>
    <ScrollView>
      {cartItems.length === 0 ? (
        <Text style={styles.displayMessage}>{displayMessage}</Text>
      ) : (
        <>
          {/* Displaying Cart Items */}
          {cartItems.map((item, index) => (
            <Card key={index} style={{ margin: 10, backgroundColor: 'white' }}>
              <Card.Title title={item.name} />
              <Card.Content>
                <Text>Price: ${item.price + deliveryFee}</Text>
                <Text style={{ fontWeight: 'bold' }}>Modifiers</Text>
                {item.selectedModifiers.map((modifier, modIndex) =>
                  modifier.options.map((option, optIndex) => (
                    <Text key={`mod-${modIndex}-opt-${optIndex}`}>
                      {option.count} x {option.name}, Extra Cost: ${option.additional_price * option.count}
                    </Text>
                  ))
                )}
                {deliveryFee > 0 && (<Text style={{ fontWeight: 'bold' }}>Delivery Fee: $15</Text>)}
              </Card.Content>
              <Card.Actions>
                { item.quantity > 1 && (
                  <FAB onPress={() => removeFromCart(item.id)}
                    icon="delete" color="red" backgroundColor="white" size="small"
                  />
                )}
                <FAB onPress={() => item.quantity > 1 ? decrementQuantity(item.id) : removeFromCart(item.id)}
                 icon={item.quantity > 1 ? "minus" : "delete"}
                 color={item.quantity > 1 ? "white" : "red"}
                 backgroundColor={item.quantity > 1 ? "orange" : "white"} size="small"
                />
                <Text>{item.quantity}</Text>
                <FAB onPress={() => incrementQuantity(item.id)}
                 icon="plus" color="white" backgroundColor="orange" size="small"
                />
              </Card.Actions>
            </Card>
          ))}

          {/* Order Type Selection */}
          <Text style={{ fontSize: 16, marginBottom: 10, paddingLeft: 10 }}>Select Order Type:</Text>
          <View style={styles.orderTypeContainer}>
            <View style={styles.orderTypeWrapper}>
              <ToggleButton.Group
                style={styles.orderTypeGroup}
                onValueChange={value => {
                  setOrderType(value);
                  if (value === 'delivery') {
                    setDeliveryFee(15);  // Set delivery fee for delivery option
                  } else {
                    setDeliveryFee(0);    // Set delivery fee for pickup option
                  }
                }}
                value={orderType}
              >
                <View style={styles.orderTypeItem}>
                  <ToggleButton icon="bike" value="delivery"/>
                  <Text style={styles.orderTypeLabel}>Delivery</Text>
                </View>

                <View style={styles.orderTypeItem}>
                  <ToggleButton icon="storefront" value="pickup"/>
                  <Text style={styles.orderTypeLabel}>Pick-Up</Text>
                </View>
              </ToggleButton.Group>
            </View>
          </View>

          {/* Payment Method Selection */}
          <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: 'bold' }}>Payment Method:</Text>

          {paymentMethods.length === 0 ? (
            <Text>No payment methods available.</Text>
          ) : (
            <View style={{ margin: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {paymentMethod && (
                <Text>{paymentMethod.brand === 'Cash' ? 'Cash Payment' : `${paymentMethod.brand}  ....${paymentMethod.last4}`}</Text>
              )}
              <Menu
                anchorPosition='anchorPosition'
                mode="elevated"
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                  <Text style={{ color: 'black', fontWeight: 'bold' }} onPress={openMenu}>
                    {paymentMethod
                      ? 'change'
                      : 'Select Payment Method'
                    }
                  </Text>
                }
              >
                {paymentMethods.map(method => (
                  <Menu.Item
                    key={method.id}
                    onPress={() => {
                      setPaymentMethod(method);
                      closeMenu();
                    }}
                    title={method.brand === 'Cash' ? 'Cash Payment' : `${method.brand}   ..... ${method.last4}`}
                  />
                ))}
              </Menu>
            </View>
          )}

          {/* Add New Payment Method Button */}
          <Button
            icon="plus"
            mode="contained"
            onPress={() => navigation.navigate('AddPaymentMethodScreen')}
          >
            Add New Payment Method
          </Button>
        </>
      )}
    </ScrollView>
    <Button
      mode="contained"
      onPress={submitOrder}
      disabled={!orderType || !paymentMethod}
      buttonColor='red'
    >
      {paymentMethod ? 'Proceed to Payment' : 'Submit Order'}
    </Button>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  orderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  orderTypeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  orderTypeGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  orderTypeItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  orderTypeLabel: {
    marginTop: 5,
    fontSize: 12,
  },
  displayMessage: {
    textAlign: 'center',
    marginTop: 300
  }
});

export default CartScreen;
