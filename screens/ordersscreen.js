import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {base_url, orders} from '../constants/api';
const OrdersScreen = ({ navigation }) => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [orderCount, setOrderCount] = useState( AsyncStorage.getItem('orderCount'))
  

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      setUserRole(role);
      if (token && role === 'customer') {
        fetchOrders(token, role);
      }
    };

    initialize();
  }, [orderCount]);
  
  const fetchOrders = async (token, role) => {
    setLoading(true);
    try {
      let url = `${base_url}${orders.order}`;
    
      if (role === 'customer') {
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

  const onRefresh = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const role = await AsyncStorage.getItem('userRole');
    fetchOrders(token, role);
  };
  
  const handleOrderAction = async (orderId, action) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const url = `https://de4a-2400-adc5-18a-ff00-fdfb-b8b5-d09b-b1c7.ngrok-free.app/api/v1/orders/${orderId}/${action}`;
      await axios.patch(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(token, userRole);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleOrderClick = (order) => {
    console.log('Navigating to OngoingOrderScreen with order ID:', order.id);
    console.log('Available Navigators:', navigation.getState().routeNames);
    if (order.status !== 'delivered' && order.status !== 'canceled') {
      navigation.navigate('OngoingOrderScreen', { id: order.id });
    } else {
      navigation.navigate('OrderDetailScreen', { orderId: order.id })
    }
  };

  const renderOrderItem = ({ item }) => {

    let statusText = '';
    let statusColor = '';
  
    switch (item.status) {
      case 'delivered':
        statusText = 'Completed';
        statusColor = 'black';
        break;
      case 'canceled':
        statusText = 'Canceled';
        statusColor = 'red';
        break;
      default:
        statusText = 'In Progress';
        statusColor = 'green';
        break;
    }
  
    return (
      <TouchableOpacity style={styles.orderItem} onPress={() => handleOrderClick(item)}>
        <Text style={styles.orderTitle}>Order #{item.id}</Text>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>

        {userRole === 'partner' && (
          <View>
            <Button title="Pick Up Order" onPress={() => handleOrderAction(item.id, 'start_delivery')} />
            <Button title="Deliver Order" onPress={() => handleOrderAction(item.id, 'partner_deliver_order')} />
          </View>
        )}
        {userRole === 'customer' && item.status !== 'canceled' && item.status !== 'delivered' && item.status !== 'picked_up' && (
          <Button title="Cancel Order" onPress={() => handleOrderAction(item.id, 'cancel_order')} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return<View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView>
      <FlatList data={ordersData}renderItem={renderOrderItem}keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text>No orders available</Text>}
        refreshControl={
                      <RefreshControl loading={loading} onRefresh={onRefresh} />
                    }
      />
    </SafeAreaView>
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
    position: 'relative',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrdersScreen;
