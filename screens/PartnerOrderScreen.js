import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import axios from 'axios';

const PartnerOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Function to fetch orders from the server
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://your-api-url/api/v1/partner_orders'); // Update URL
        setOrders(response.data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text>Order ID: {item.id}</Text>
      {/* Display other order details */}
      <Button title="Start Delivery" onPress={() => startDelivery(item.id)} />
      {/* Add other buttons/actions as needed */}
    </View>
  );

  const startDelivery = async (orderId) => {
    // Function to handle starting delivery for an order
    try {
      await axios.post(`http://your-api-url/api/v1/start_delivery`, { partner_order_id: orderId });
      // Handle successful start
    } catch (err) {
      // Handle error
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
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
  // Other styles as needed
});

export default PartnerOrderScreen;
