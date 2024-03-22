import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrdersScreen = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noOrdersMessage, setNoOrdersMessage] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        fetchOrders(token);
        setupWebSocketConnections(token);
      }
    };

    initialize();
  }, []);

  const fetchOrders = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/orders', { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      console.log('API Response:', response.data); // Log the response data here

      if (response.data.message) {
        setNoOrdersMessage(response.data.message);
      } else {
        setOrdersData(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketConnections = (token) => {
    const orderWs = new WebSocket(createWebSocketURL('OrderChannel', 'user_order_id', token));
    orderWs.onmessage = handleMessage;

    const partnerOrderWs = new WebSocket(createWebSocketURL('PartnerOrderChannel', 'partner_order_id', token));
    partnerOrderWs.onmessage = handleMessage;

    return () => {
      orderWs.close();
      partnerOrderWs.close();
    };
  };

  const createWebSocketURL = (channel, orderId, token) => {
    return `ws://localhost:3000/cable?channel=${channel}&order_id=${orderId}&token=${token}`;
  };

  const handleMessage = (e) => {
    const message = JSON.parse(e.data);
    if (message.type === 'message') {
      const data = JSON.parse(message.message);
      if (data.status) {
        updateOrderStatus(data);
      }
    }
  };

  const updateOrderStatus = (updatedOrder) => {
    const updatedOrders = ordersData.map(order => {
      if (order.id === updatedOrder.id) {
        return { ...order, status: updatedOrder.status };
      }
      return order;
    });
    setOrdersData(updatedOrders);
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderTitle}>{item.title}</Text>
      <Text style={styles.orderDate}>{item.date}</Text>
      <Text style={styles.orderStatus}>{item.status}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {noOrdersMessage ? (
        <Text style={styles.noOrdersText}>{noOrdersMessage}</Text>
      ) : (
        <FlatList
          data={ordersData}
          renderItem={renderOrder}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    fontSize: 16,
    color: 'grey',
    textAlign: 'center',
    marginTop: 20,
  },
  orderItem: {
    backgroundColor: '#f6f6f6',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A90E2',
  },
  // ... Additional styles if needed
});

export default OrdersScreen;
