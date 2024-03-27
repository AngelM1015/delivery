import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../components/CartContext';

const CartScreen = () => {
  const { cartItems, removeFromCart } = useCart();
  const [orderDetails, setOrderDetails] = React.useState(null);

  const renderOption = (option) => {
    const { optionId, count } = option;
    return (
      <Text key={optionId} style={styles.option}>
        {`Option ID: ${optionId} (Count: ${count})`}
      </Text>
    );
  };
  
  const renderModifiers = (modifiers) => {
    return modifiers.map((modifier) => {
      const { modifierId, options } = modifier;
      return (
        <View key={modifierId} style={styles.modifierContainer}>
          <Text style={styles.modifierTitle}>Modifier ID: {modifierId}</Text>
          {options.map(renderOption)}
        </View>
      );
    });
  };

  const renderOrderDetails = () => {
    if (!orderDetails) {
      return null;
    }
    return (
      <View style={styles.orderDetailsContainer}>
        <Text style={styles.orderDetailsText}>Order ID: {orderDetails.id}</Text>
        <Text style={styles.orderDetailsText}>Status: {orderDetails.status}</Text>
        <Text style={styles.orderDetailsText}>Estimated Wait Time: {orderDetails.estimated_wait_time} minutes</Text>
        {/* Add more details as needed */}
      </View>
    );
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const submitOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const orderData = {
        order: {
          restaurant_id: 1,
          delivery_address: '30 Aspen Leaf Dr. Big Sky, MT 59716',
          total_price: calculateTotalPrice(cartItems),
          items: cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: 1,
            selected_modifiers: item.selectedModifiers.map(modifier => ({
              modifier_id: modifier.modifierId,
              options: modifier.options.map(opt => opt.optionId)
            }))
          }))
        }
      };

      const response = await axios.post('http://localhost:3000/api/v1/create_order', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrderDetails(response.data.order); // Set order details
    } catch (error) {
      console.error('Order submission error:', error);
      Alert.alert('Error', 'Failed to submit order');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyCartText}>Your cart is empty.</Text>
      ) : (
        cartItems.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            {renderModifiers(item.selectedModifiers)}
            <Button title="Remove" onPress={() => removeFromCart(item.id)} color="#e53935" />
          </View>
        ))
      )}
      <Button title="Send Order" onPress={submitOrder} color="#4CAF50" />
      {renderOrderDetails()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 10,
    },
    itemContainer: {
      marginBottom: 15,
      padding: 10,
      borderRadius: 5,
      backgroundColor: '#f0f0f0',
      borderWidth: 1,
      borderColor: '#ccc',
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    modifierContainer: {
      marginTop: 10,
    },
    modifierTitle: {
      fontWeight: '500',
    },
    option: {
      marginLeft: 15,
      fontSize: 16,
    },
    emptyCartText: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 50,
    },
    orderDetailsContainer: {
      marginTop: 20,
      padding: 10,
      borderRadius: 5,
      backgroundColor: '#e0e0e0',
      borderWidth: 1,
      borderColor: '#ccc',
    },
    orderDetailsText: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default CartScreen;