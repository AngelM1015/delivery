import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {base_url, orders} from '../constants/api';
import { COLORS } from '../constants/colors';

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
      const url = `https:/localhost:3000/api/v1/orders/${orderId}/${action}`;
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
      navigation.navigate('OngoingOrder', { id: order.id });
    } else {
      navigation.navigate('OrderDetails', { orderId: order.id })
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
      <TouchableOpacity onPress={() => handleOrderClick(item)} style={{paddingHorizontal: 10}}>
        <View style={styles.orderItem}>
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} >
            <Text style={styles.orderTitle}>Order ID {item.id}</Text>
            <View style={{backgroundColor: '#f0f0f0', padding: 10, borderRadius: 16, width: '30%'}}>
              <Text style={{color: statusColor, textAlign: 'center'}}>{statusText}</Text>
            </View>
          </View>
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
            <View style={{flexDirection:'row', alignItems:'center', marginTop: 15}}>
              <Image source={require('../assets/images/icon.png')} style={{width: 60, height: 60}}/>
              <View style={{ marginLeft: 15, gap: 10 }}>
                <Text style={{ color: COLORS.black, fontSize: 20, fontWeight: 'bold' }}>{item.restaurant_name}</Text>
                <Text style={{ color: 'grey', fontSize: 14 }}>
                  {item.order_items.map(orderItem => orderItem.menu_item).join(', ')}
                </Text>
                <Text style={{ color: '#F09B00', fontSize: 14 }}>
                  ${item.total_price}
                </Text>
              </View>
            </View>
            <Text style={{color: COLORS.black, fontWeight: '400', fontSize: 12}}>{item.order_items.length} item</Text>
          </View>
          {userRole === 'customer' && item.status !== 'canceled' && item.status !== 'delivered' && item.status !== 'picked_up' && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleOrderAction(item.id, 'cancel_order')}>
              <Text style={{color: 'white'}}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

        {userRole === 'partner' && (
          <View>
            <Button title="Pick Up Order" onPress={() => handleOrderAction(item.id, 'start_delivery')} />
            <Button title="Deliver Order" onPress={() => handleOrderAction(item.id, 'partner_deliver_order')} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return<View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView>
      <Text style={{ color: COLORS.black, fontSize: 20, fontWeight: 'bold', margin: 10 }}>Past orders</Text>
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
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
  cancelButton: {
    backgroundColor: '#FF4040',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
    width:'30%',
  }
});

export default OrdersScreen;
