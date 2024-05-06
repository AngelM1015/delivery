import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RestaurantOwnerOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
        if (!token) {
          setError('User token not found.');
          Alert.alert('Authentication Error', 'User token not found.');
          return;
        }
        fetchOrders(token, role);
        const intervalId = setInterval(() => fetchOrders(token, role), 1800000); // 30 minutes

        return () => clearInterval(intervalId);
      } catch (err) {
        console.error('Error during initialization:', err);
        setError(err.message);
      }
    };

    initialize();
  }, []);

  const fetchOrders = async (token, role) => {
    try {
      setLoading(true);
      let url = 'http://localhost:3000/api/v1/partners/partner_orders'; // Assuming endpoint for restaurant owner orders
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'pending':
        return <Text style={styles.pendingStatus}>Pending</Text>;
      case 'accepted':
        return <Text style={styles.acceptedStatus}>Accepted</Text>;
      case 'completed':
        return <Text style={styles.completedStatus}>Completed</Text>;
      default:
        return <Text style={styles.defaultStatus}>Unknown</Text>;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderText}>Order ID: {item.id}</Text>
      <Text>Customer: {item.user.first_name} {item.user.last_name}</Text>
      <Text>Address: {item.delivery_address}</Text>
      <Text>Status: {renderStatus(item.status)}</Text>
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0000ff" /><Text style={styles.loadingText}>Loading orders...</Text></View>;
  if (error) return <View style={styles.centered}><Text style={styles.errorText}>Error: {error}</Text></View>;
  if (orders.length === 0) return <View style={styles.centered}><Text>No orders available</Text></View>;

  return <FlatList data={orders} renderItem={renderItem} keyExtractor={item => item.id.toString()} />;
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  orderItem: { padding: 20, marginVertical: 8, marginHorizontal: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ddd', borderRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  orderText: { fontSize: 16, color: '#333' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#007bff' },
  errorText: { marginTop: 10, fontSize: 18, color: 'red' },
  pendingStatus: { color: '#ffcc00' },
  acceptedStatus: { color: '#00cc00' },
  completedStatus: { color: '#3366ff' },
  defaultStatus: { color: '#666666' },
});

export default RestaurantOwnerOrderScreen;
