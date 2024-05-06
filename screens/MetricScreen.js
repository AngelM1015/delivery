import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Card, Button, Text, Modal, Portal, Provider, Snackbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import ActionCable from 'react-native-actioncable';

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

const processChartData = (orders, userRole) => {
    if (!Array.isArray(orders)) return { labels: [], datasets: [{ data: [] }] };
    const statusCounts = orders.reduce((acc, order) => {
        const abbrStatus = abbreviateStatus(order.status);
        acc[abbrStatus] = (acc[abbrStatus] || 0) + 1;
        return acc;
    }, {});
    return {
        labels: Object.keys(statusCounts),
        datasets: [{ data: Object.values(statusCounts) }],
    };
};

const MetricScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cable, setCable] = useState(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const fetchUserRoleAndOrders = async () => {
            const token = await AsyncStorage.getItem('userToken');
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            const headers = { 'Authorization': `Bearer ${token}` };
            let apiUrl = 'http://localhost:3000/api/v1/orders';
            apiUrl += role === 'restaurant_owner' ? '/restaurant_orders' : role === 'admin' ? '/all_orders' : '/partner_orders';
            try {
                const response = await axios.get(apiUrl, { headers });
                setOrders(response.data);
                response.data.forEach(order => handleReceived({ order_id: order.id, status: order.status }));
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        const fetchToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            const cableUrl = `ws://localhost:3000/cable?token=${token}`;
            setCable(ActionCable.createConsumer(cableUrl));
        };
        fetchToken();
        fetchUserRoleAndOrders();
    }, []);

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
    
    const subscribeToChannel = orderId => {
        cable.subscriptions.create({ channel: "ApplicationCable::OrderChannel", order_id: orderId }, { received: handleReceived });
    };

    const updateOrderStatus = async () => {
        if (!selectedOrderId) return;
    
        cable.subscriptions.subscriptions.forEach(subscription => {
            if (subscription.identifier.includes(`"order_id":${selectedOrderId}`)) {
                subscription.perform('send_status_update', { status: selectedStatus, order_id: selectedOrderId });
            }
        });
        console.log('Attempting to update status for order:', selectedOrderId, 'with new status:', selectedStatus);
        setModalVisible(false);
    };

    const chartData = processChartData(orders, userRole);

    const renderItem = ({ item }) => (
        <Card style={styles.menuItem}>
            <Card.Content>
                <Text style={styles.menuText}>Order ID: {item.id}</Text>
                <Text style={styles.menuText}>Status: {formatStatus(item.status)}</Text>
                <Text style={styles.menuText}>Restaurant: {item.restaurant_name}</Text>
            </Card.Content>
            <Card.Actions>
                <Ionicons name="create-outline" size={24} onPress={() => { setModalVisible(true); setSelectedStatus(item.status); setSelectedOrderId(item.id); subscribeToChannel(item.id); }} />
                <Ionicons name="information-circle-outline" size={24} onPress={() => navigation.navigate('OrderDetailScreen', { orderId: item.id })} />
            </Card.Actions>
        </Card>
    );

    return (
        <Provider>
            <View style={styles.container}>
                <Text style={styles.title}>Metrics Screen</Text>
                <BarChart
                    data={chartData}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    yAxisLabel=""
                    chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: { borderRadius: 16 }
                    }}
                    verticalLabelRotation={30}
                    style={{ marginVertical: 10, borderRadius: 16 }}
                />
                <FlatList data={orders} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} style={styles.flatList} />
                <Portal>
                    <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
                        <Card style={styles.modalContent}>
                            <Card.Title title="Update Order Status" right={(props) => <Ionicons {...props} name="close" onPress={() => setModalVisible(false)} />} />
                            <Card.Content>
                                <Picker selectedValue={selectedStatus} onValueChange={(itemValue) => setSelectedStatus(itemValue)}>
                                    <Picker.Item label="Pending Approval" value="restaurant_pending_approval" />
                                    <Picker.Item label="Approved" value="restaurant_approved" />
                                    <Picker.Item label="Pending Assignment" value="partner_pending_assignment" />
                                    <Picker.Item label="Assigned" value="partner_assigned" />
                                    <Picker.Item label="Delivered" value="delivered" />
                                    <Picker.Item label="Canceled" value="canceled" />
                                </Picker>
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={updateOrderStatus}>Update Status</Button>
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
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    menuItem: {
        marginVertical: 5,
        borderRadius: 8,
    },
    menuText: {
        fontSize: 18,
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