import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrdersScreen = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
      if (token && role === 'customer') { // Only fetch orders if the user role is 'customer'
        fetchOrders(token, role);
      }
    };
  
    initialize();
  }, []);
  

  const fetchOrders = async (token, role) => {
    setLoading(true);
    try {
      let url = 'http://localhost:3000/api/v1/orders';
      if (role === 'customer') { // Only fetch orders for customers
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrdersData(response.data);
      } else {
        setOrdersData([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };  
  

const handleOrderAction = async (orderId, action) => {
  const token = await AsyncStorage.getItem('userToken');
  try {
    const url = `http://localhost:3000/api/v1/orders/${orderId}/${action}`;
    await axios.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchOrders(token, userRole);
  } catch (error) {
    console.error('Error updating order:', error);
  }
};
  

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderTitle}>Order #{item.id}</Text>
      <Text>Status: {item.status}</Text>
      {/* Additional order details */}
      {userRole === 'partner' && (
        <View>
          <Button title="Pick Up Order" onPress={() => handleOrderAction(item.id, 'start_delivery')} />
          <Button title="Deliver Order" onPress={() => handleOrderAction(item.id, 'partner_deliver_order')} />
        </View>
      )}
      {userRole === 'customer' && (
        <Button title="Cancel Order" onPress={() => handleOrderAction(item.id, 'cancel_order')} />
      )}
    </View>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <FlatList
      data={ordersData}
      renderItem={renderOrderItem}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={<Text>No orders available</Text>}
    />
  );
};

const styles = StyleSheet.create({
  orderItem: {
    padding: 20,
    margin: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Additional styles
});

export default OrdersScreen;