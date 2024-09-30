import React, { useEffect, useState } from 'react';
import { ScrollView, Alert, View } from 'react-native';
import { Button, Card, Text, Title, Paragraph, ToggleButton, FAB } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import ActionCable from 'react-native-actioncable';

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);
  const [cable, setCable] = useState(null);
  const [orderType, setOrderType] = useState(null);

  useEffect(() => {
    fetchTokenAndConnect();
  }, []);

  const fetchTokenAndConnect = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }
      const cableUrl = `ws://192.168.18.86:3000/cable?token=${token}`;
      const actionCable = ActionCable.createConsumer(cableUrl);
      setCable(actionCable);
    } catch (error) {
      console.error('Error fetching token and connecting:', error);
      Alert.alert('Error', 'Failed to fetch token and connect to ActionCable');
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

  const renderOrderDetails = () => {
    if (!orderDetails) return null;
    return (
      <Card style={{ margin: 10 }}>
        <Card.Content>
          <Title>Order ID: {orderDetails.id}</Title>
          <Paragraph>Status: {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1).replace(/_/g, ' ')}</Paragraph>
          <Paragraph>Estimated Wait Time: {orderDetails.estimated_wait_time} minutes</Paragraph>
        </Card.Content>
      </Card>
    );
  };

  const submitOrder = async () => {
    if (!orderType) {
      Alert.alert('Error', 'Please select an order type');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

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
          order_type: orderType, // Include order type in order data
          order_items_attributes: cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            order_item_modifiers_attributes: item.selectedModifiers.map(modifier => ({
              modifier_option_id: modifier.modifierId
            }))
          }))
        }
      };

      const response = await axios.post('http://localhost:3000/api/v1/orders/create_order', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // console.log('new order', response.data)

      navigation.navigate('OngoingOrderScreen', { orderId: response.data.order.id })

      setOrderDetails(response.data.order);
      clearCart();
    } catch (error) {
      console.error('Order submission error:', error);
      Alert.alert('Error', 'Failed to submit order');
    }
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  return (
    <ScrollView>
      {cartItems.length === 0 ? (
        <Text>Your cart is empty.</Text>
      ) : (
        cartItems.map((item, index) => {
          return (
            <Card key={index} style={{ margin: 10, backgroundColor: 'white' }}>
              <Card.Title title={item.name} />
              <Card.Content>
                <Text>Price: ${item.price}</Text>
                <Text style={{ fontWeight: 'bold' }}>Modifiers</Text>
                {item.selectedModifiers.map((modifier, modIndex) =>
                  modifier.options.map((option, optIndex) => (
                    <Text key={`mod-${modIndex}-opt-${optIndex}`}>
                      {option.count} x {option.name}, Extra Cost: ${option.additional_price * option.count}
                    </Text>
                  ))
                )}
              </Card.Content>
              <Card.Actions>
                <FAB onPress={() => decrementQuantity(item.id) }
                 icon="minus" color='white' backgroundColor='orange' size='small' />
                <Text>{item.quantity}</Text>
                <FAB onPress={() => incrementQuantity(item.id)}
                 icon="plus" color='white' backgroundColor='orange' size='small' />
                <FAB onPress={() => removeFromCart(item.id)}
                 icon="delete" color='red' backgroundColor='white' size='small' />
              </Card.Actions>
            </Card>
          );
        })
      )}

      {cartItems.length > 0 && (
        <>
          <Text style={{ fontSize: 16, marginBottom: 10, paddingLeft: 10 }}>Select Order Type:</Text>
          <View style={{ margin: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <ToggleButton.Group
              onValueChange={value => setOrderType(value)}
              value={orderType}
            >
              <ToggleButton icon="truck-delivery" value="delivery" label="Delivery" />
              <ToggleButton icon="storefront" value="pickup" label="Pick-Up" />
            </ToggleButton.Group>
          </View>

          <Text style={{ fontSize: 16, marginTop: 10 }}>
            {orderType === 'delivery' && 'You have selected Delivery.'}
            {orderType === 'pickup' && 'You have selected Pick Up.'}
          </Text>

          <Button
            onPress={submitOrder}
            mode="contained"
            style={{ margin: 10 }}
            disabled={!orderType} // Disable if order type is not selected
          >
            Send Order
          </Button>
        </>
      )}

      {renderOrderDetails()}
    </ScrollView>
  );
};

export default CartScreen;
