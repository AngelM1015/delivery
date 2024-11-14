import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, RefreshControl } from 'react-native';
import { Card, Button, Text, Modal, Portal, Provider, Snackbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import cable from '../cable';
import useUser from '../hooks/useUser';
import usePartnerOrders from '../hooks/usePartnerOrders';
import PartnerOrders from '../components/PartnerOrders';

const formatStatus = status => {
    return status
        .split('_')
        .map(word => word[0].toUpperCase() + word.substr(1).toLowerCase())
        .join(' ');
};

  const abbreviateStatus = (status) => {
    const abbreviations = {
        'restaurant_pending_approval': 'RPA',
        'restaurant_approved': 'RA',
        'partner_pending_assignment': 'PPA',
        'partner_assigned': 'PA',
        'delivered': 'Del',
        'canceled': 'Can'
    };
    return abbreviations[status] || status;
  };

  const processChartData = (orders) => {
    if (!Array.isArray(orders)) return { labels: [], datasets: [{ data: [] }] };
  
    const timeRanges = {
      Morning: [5, 12],
      After: [12, 17],
      Evening: [17, 21],
      Night: [21, 5]
    };
  
    const timeCounts = { Morning: 0, After: 0, Evening: 0, Night: 0 };
  
    orders.forEach(order => {
      const orderHour = new Date(order.created_at).getHours();
  
      if (orderHour >= timeRanges.Morning[0] && orderHour < timeRanges.Morning[1]) {
        timeCounts.Morning += 1;
      } else if (orderHour >= timeRanges.After[0] && orderHour < timeRanges.After[1]) {
        timeCounts.After += 1;
      } else if (orderHour >= timeRanges.Evening[0] && orderHour < timeRanges.Evening[1]) {
        timeCounts.Evening += 1;
      } else {
        timeCounts.Night += 1;
      }
    });
  
    return {
      labels: Object.keys(timeCounts),
      datasets: [{ data: Object.values(timeCounts) }],
      barColors: ['blue'],
    };
  };
  

  const MetricScreen = ({ navigation }) => {
    const { partnerOrders, fetchAllPartnerOrders } = usePartnerOrders();
    const [orders, setOrders] = useState([]);
    const { token, role } = useUser();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [restaurant, setRestaurant] = useState('');

    useEffect(() => {
      if (partnerOrders && partnerOrders.length > 0) {
        setOrders(partnerOrders);
      }
    }, [partnerOrders]);

  const fetchOrders = async () => {
    setRefreshing(true);
    const headers = { Authorization: `Bearer ${token}` };
    let apiUrl = 'http://localhost:3000/api/v1/orders';
    apiUrl += role === 'restaurant_owner' ? '/restaurant_orders' : role === 'admin' ? '/all_orders' : '/partner_orders';
    try {
        console.log('token in metric', token)
        console.log('role in metricx', role)
        console.log('apiurl in metric', apiUrl)
        const response = await axios.get(apiUrl, { headers: headers });
        setOrders(response.data);
        setRestaurant(response.data[0]['restaurant_id'])
        console.log('restaurant', response.data[0]['restaurant_id'])
        response.data.forEach(order => handleReceived({ order_id: order.id, status: order.status }));

        if (role === 'restaurant_owner'){
          restaurantSubscription(response.data[0]['restaurant_id']);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const restaurantSubscription = async (id) => {
    const restaurantId = id

    subscription = cable.subscriptions.create(
      { channel: 'RestaurantChannel', id: restaurantId },
      {
        received: (data) => {
          console.log('data', data)
          setOrders((prevOrders) => [data, ...prevOrders]);
        },
      }
    );

    console.log('restaurant subscription', subscription)
  }

  const onRefresh = () => {
    fetchOrders();
  };

  const handleReceived = data => {
      const { order_id, status } = data.order ? { order_id: data.order.id, status: data.order.status } : data;
  
      console.log('Data Order Id: ', order_id, ', Received data: ', data);
  
      if (data.message && data.message.startsWith("Order status updated")) {
          setSnackbarMessage(`Status updated to, ${status.replace(/_|-|\\. /g, ' ')}`);
          setSnackbarVisible(true);
          setOrders(prevOrders =>
              prevOrders.map(order =>
                  order.id === order_id ? { ...order, status: status } : order
              )
          );
      }
  };

  const updateOrderStatus = async (id) => {
    if (!selectedOrderId) return;

    const token = await AsyncStorage.getItem('userToken');

    const response = await axios.put(`http://localhost:3000/api/v1/orders/${id}/update_status`,
      { status: selectedStatus },
      {
        headers: { 'Authorization': `Bearer ${token}`}
      }
    )

    setModalVisible(false);
  };

  const chartData = processChartData(orders, role);

  const renderItem = ({ item }) => (
    <Card style={styles.menuItem}>
      <Card.Content style={{gap: 5, paddingTop: 0}}>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.orderId}> Order #{item.id}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 5}}>
          <Text style={styles.menuText}> Status: </Text>
          <Text style={styles.menuText}>{formatStatus(item.status)}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 5}}>
          <Text style={styles.menuText}>  Restaurant: </Text>
          <Text style={styles.menuText}>{item.restaurant_name}</Text>
        </View>
      </Card.Content>
      {role === 'restaurant_owner' && (
        <Card.Actions>
          <Ionicons name="create-outline" size={24} onPress={() => { setModalVisible(true); setSelectedStatus(item.status); setSelectedOrderId(item.id); }} />
          <Ionicons name="information-circle-outline" size={24} onPress={() => navigation.navigate('OrderDetailScreen', { orderId: item.id })} />
        </Card.Actions>
      )}
    </Card>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={250}
          yAxisLabel=""
          chartConfig={{
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            barPercentage: 1.3,
            color: () => `#FFFFFF`,
            labelColor: () => `#FFFFFF`,
            fillShadowGradientOpacity: 1,
            barRadius: 4,
            propsForLabels: {
              fontSize: 14,
              fontWeight: 600
            },
            style: {borderRadius: 16}
          }}
          showBarTops={false}
          flatColor={true}
          withInnerLines={false}
          style={{marginVertical: 20, borderRadius: 16}}
        />
        <FlatList data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()} style={styles.flatList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
            <Card style={styles.modalContent}>
              <Card.Title title="Update Order Status" right={(props) => <Ionicons {...props} name="close" onPress={() => setModalVisible(false)} />} />
              <Card.Content>
                <Picker selectedValue={selectedStatus} onValueChange={(itemValue) => setSelectedStatus(itemValue)}>
                  <Picker.Item label="Approved" value="restaurant_approved" />
                  <Picker.Item label="Delivered" value="delivered" />
                  <Picker.Item label="Canceled" value="canceled" />
                </Picker>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => updateOrderStatus(selectedOrderId)}>Update Status</Button>
              </Card.Actions>
            </Card>
          </Modal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}>
            {snackbarMessage}
          </Snackbar>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderId: {
    color: '#F09B00',
    fontSize: 24,
    marginBottom: 8,
    fontWeight: 700
  },
  menuItem: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    paddingVertical: 14
  },
  menuText: {
    fontSize: 18,
    color: '#8F90A6'
  },
  icon: {
    marginRight: 10,
  },
  flatList: {
    marginTop: 10,
  },
  modalContent: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
});

export default MetricScreen;