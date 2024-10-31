import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import useOrders from '../hooks/useOrders';

const PartnerOrderScreen = ({ navigation }) => {
  const { loading, partnerOrders, fetchPartnerOrders} = useOrders();
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPartnerOrders();
  }, []);

  // const fetchPartnerOrders = async (token) => {
  //   try {
  //     setLoading(true);
  //     let url = 'api/v1/orders/partner_pending_orders';
  //     const response = await client.get(url, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setOrders(response.data);
  //   } catch (err) {
  //     console.error('Error fetching orders:', err);
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onRefresh = async () => {
    fetchPartnerOrders();
  };

  const handleOrderClick = (order) => {
    navigation.navigate('OngoingOrderScreen', { id: order.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderItem} onPress={() => handleOrderClick(item)}>
    <View style={styles.orderItem}>
      <Text style={styles.orderText}>Order ID: {item.id}</Text>
      {item.user && <Text>Customer: {item.user.email} </Text>}
      <Text>Delivery Address: {item.delivery_address}</Text>
      <Text>Restaurant Address: {item.restaurant_address}</Text>
      <Text>Pick Up at:  {item.pick_up_time}</Text>
    </View>
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0000ff" /><Text style={styles.loadingText}>Loading orders...</Text></View>;
  if (error) return <View style={styles.centered}><Text style={styles.errorText}>Error: {error}</Text></View>;
  if (partnerOrders.length === 0) return <View style={styles.centered}><Text>No orders available</Text></View>;

  return <FlatList data={partnerOrders} renderItem={renderItem} keyExtractor={item => item.id.toString()} 
  refreshControl={
    <RefreshControl loading={loading} onRefresh={onRefresh} />
  }/>;
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  orderItem: { padding: 20, marginVertical: 8, marginHorizontal: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ddd', borderRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  orderText: { fontSize: 16, color: '#333' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#007bff' },
  errorText: { marginTop: 10, fontSize: 18, color: 'red' },
});

export default PartnerOrderScreen;
