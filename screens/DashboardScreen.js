import React, { useState, useEffect } from 'react';
import { Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useUser from '../hooks/useUser';
import PartnerOrders from '../components/PartnerOrders';

const DashboardScreen = () => {
  const [role, setRole] = useState(null);
  // const { token, role } = useUser()
  const [data, setData] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  useEffect(() => {
    const fetchRoleAndData = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setRole(role);
      
        try {
          await fetchData(role);
        } catch (error) {
          console.error('Error initializing dashboard:', error);
        }
    };

    const fetchData = async (role) => {
      try {
        let endpoint;
        if (role === 'partner') {
            endpoint = 'orders/partner_orders';
        } else {
            endpoint = role === 'restaurant_owner' ? 'analytics/menu_item_performance' : null;
        }
        if (endpoint) {
          const token = await AsyncStorage.getItem('userToken');
          const response = await axios.get(`http://192.168.150.27:3000/api/v1/${endpoint}`, {
              headers: { Authorization: `Bearer ${token}`}
          });
          if (role === 'partner') {
            setOrders(response.data);
            groupOrders(response.data);
            // console.log('partner orderrs', response.data)
          } else {
            setData(response.data);
          }
        }
      } catch (error) {
          console.error('Error fetching data:', error);
      } finally {
          setLoading(false);
      }
    };

    fetchRoleAndData();
  }, []);

  const groupOrders = (partnerOrders) => {
    const groupedOrders = partnerOrders.reduce((x, y) => {

      (x[y.status] = x[y.status] || []).push(y);

      return x;

  }, {})

    setCompletedOrders(groupedOrders.delivered.length);
    setCanceledOrders(groupedOrders.canceled.length);
  }

  const renderDashboard = () => {
    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (role === 'partner') {
      return (
        <>
          <View style={styles.orderGroups}>
            <Text style={styles.canceledOrders}> {canceledOrders} Cancel</Text>
            <Text style={styles.completedOrders}>{completedOrders} Completed</Text>
          </View> 
          <TouchableOpacity style={styles.orderHistoryButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.orderHistoryButtonText}>Order History</Text>
          </TouchableOpacity>
          <PartnerOrders 
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            orders={orders}
          />
        </>
      );
    } else if (role === 'restaurant_owner') {
    } else if (role === 'admin') {
        return <Text>Hi Admin</Text>;
    } else {
        return <Text>Role-specific data not available.</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      {renderDashboard()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  orderGroups: {
    flexDirection: 'row',
    gap: 20,
    marginStart: 14
  },
  canceledOrders: {
    color: 'red',
    fontSize: 20
  },
  completedOrders: {
    color: 'green',
    fontSize: 20
  },
  orderHistoryButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'start',
    margin: 20,
  },
  orderHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orderListContainer: {
    padding: 20,
  },
});

export default DashboardScreen;
