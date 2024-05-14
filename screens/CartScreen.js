import React, { useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Button, Card, Text, Title, Paragraph } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import ActionCable from 'react-native-actioncable';
import moment from 'moment';

const CartScreen = () => {
  const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const [orderDetails, setOrderDetails] = React.useState(null);
  const [userOrders, setUserOrders] = React.useState([]);
  const [cable, setCable] = React.useState(null);

  useEffect(() => {
    fetchTokenAndConnect();
    fetchUserOrders();
  }, []);

  const fetchTokenAndConnect = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }
      const cableUrl = `ws://localhost:3000/cable?token=${token}`;
      const actionCable = ActionCable.createConsumer(cableUrl);
      setCable(actionCable);
    } catch (error) {
      console.error('Error fetching token and connecting:', error);
      Alert.alert('Error', 'Failed to fetch token and connect to ActionCable');
    }
  };

  const fetchUserOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }
      
      const response = await axios.get('http://localhost:3000/api/v1/orders/user_orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserOrders(response.data);
      console.log('User orders:', response.data);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      Alert.alert('Error', 'Failed to fetch user orders');
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
          delivery_address: '209 Aspen Leaf Dr. Big Sky, MT 59716',
          total_price: calculateTotalPrice(cartItems),
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
          console.log("LOOK HERE >", item);
          return (
            <Card key={index} style={{ margin: 10 }}>
              <Card.Title title={item.name} />
              {item.selectedModifiers.map((modifiers, modIndex) =>
                modifiers.options.map((option, optIndex) => (
                  <Text key={`mod-${modIndex}-opt-${optIndex}`}>
                    Modifier: {option.name}, Extra Cost: ${option.count}
                  </Text>
                ))
              )}
              <Card.Actions>
                <Button onPress={() => decrementQuantity(item.id)}>-</Button>
                <Text>{item.quantity}</Text>
                <Button onPress={() => incrementQuantity(item.id)}>+</Button>
                <Button onPress={() => removeFromCart(item.id)} color="#e53935">Remove</Button>
              </Card.Actions>
            </Card>
          );
        })
      )}
  
      <Button onPress={submitOrder} mode="contained" style={{ margin: 10 }}>Send Order</Button>
      {renderOrderDetails()}
      {userOrders && userOrders.length > 0 && (
        <Card style={{ margin: 10 }}>
          <Card.Title title="Your Orders" />
          <Card.Content>
            {userOrders.map(order => (
              <Paragraph key={order.id}>
                Order ID: {order.id} - Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")} - Time & Day created: {moment(order.created_at).format('MMMM Do YYYY, h:mm:ss a')}
              </Paragraph>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
  
  
};

export default CartScreen;
