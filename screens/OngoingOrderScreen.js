import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import cable from '../cable';
import { FAB } from 'react-native-paper';

const OngoingOrderScreen = ({ isVisible, onClose, id }) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const route = useRoute();
  const navigation = useNavigation();
  const [order, setOrder] = useState({});
  const [userRole, setUserRole] = useState('')
  const [customerMessage, setCustomerMessage] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');

  useEffect(() => {
    console.log('id of order ', route.params.id);
    const fetchOngoingOrder = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
      if (!token) {
        Alert.alert('Error', 'No token');
        return;
      }
  
      try {

        const response = await axios.get(`http://192.168.150.27:3000/api/v1/orders/${route.params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const ongoingOrder = response.data;
        console.log('ongoing order', ongoingOrder);

        setOrder(ongoingOrder);

        if (cable.connection.isOpen()) {
          console.log("WebSocket connection is open.");
        } else {
          console.log("WebSocket connection is not open.");
        }

        const subscription = await cable.subscriptions.create(
          { channel: 'OrderChannel', id: route.params.id },
          {
            received(data) {
              console.log("new order message:", data);
              if(data.partner_message){
                setPartnerMessage(data.partner_message);
              }

              if(data.customer_message){
                setCustomerMessage(data.customer_message);
              }
            },
          }
        );

        console.log('subscription', subscription);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching ongoing order:', error);
      }
    };
  
    fetchOngoingOrder();
  }, [route.params.id]);

  const handlePickedUp = async () => {
    const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'you have been logged out!');
        return;
      }

      try {
        await axios.patch(`https://192.168.150.27:3000/api/v1/orders/${order.id}/pick_up_order`, order, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (order.order_type === 'pickup'){
          navigation.replace('Main');
        } else {
          Alert.alert('Error', 'something went wrong!');
        }
      } catch (error) {
        Alert.alert('Error', 'something went wrong!');
      }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Order Details</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.orderText}>Order ID: {order.id}</Text>
          <Text>Status: {order.status}</Text>
          <Text>Order message: {customerMessage}</Text>
          <Text>Your order will be delivered in {order.estimated_wait_time} - {order.estimated_wait_time + 15} mins</Text>
          {order.status === 'partner_assigned' && (
            <>
            <FAB
              icon='message'
              style={styles.fab}
              onPress={() => navigation.navigate('Chat', { conversationId: order.conversation_id })}
            />
            </>
          )}
          {order.order_type === 'pickup' && order.status === 'restaurant_approved' && (
            <TouchableOpacity style={styles.pickupButton} onPress={() => handlePickedUp()}>
              <Text style={styles.pickupButtonText}>Pick Your Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  content: {
    marginTop: 20,
  },
  orderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'white',
  },
  pickupButton: {
    marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'orange',
    borderRadius: 8,
    alignItems: 'center',
  },
  pickupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default OngoingOrderScreen;
