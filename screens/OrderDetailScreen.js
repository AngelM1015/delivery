import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailScreen = ({ route }) => {
    const { orderId } = route.params;
    const [orderDetails, setOrderDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setIsLoading(true);
            try {
                const token = await AsyncStorage.getItem('userToken');
                const headers = { 'Authorization': `Bearer ${token}` };
                const response = await axios.get(`http://localhost:3000/api/v1/orders/${orderId}`, { headers });
                setOrderDetails(response.data);
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const renderItem = ({ item }) => {
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemText}>Menu Item ID: {item.menu_item_id}</Text>
                <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemText}>Item: {item.menu_item_name}</Text>
                <Text style={styles.itemText}>Price: ${item.price}</Text>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <Text>Loading order details...</Text>
            </View>
        );
    }

    if (!orderDetails) {
        return (
            <View style={styles.centered}>
                <Text>Order details not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order Detail Screen</Text>
            <Text style={styles.orderInfo}>Order ID: {orderDetails.id}</Text>
            <Text style={styles.orderInfo}>Restaurant Name: {orderDetails.restaurant_name}</Text>
            <Text style={styles.orderInfo}>Customer Name: {orderDetails.customer_name}</Text>
            <Text style={styles.orderInfo}>Customer Email: {orderDetails.customer_email}</Text>
            <Text style={styles.orderInfo}>Total Price: ${orderDetails.total_price}</Text>
            <Text style={styles.orderInfo}>Estimated Wait Time: {orderDetails.estimated_wait_time} minutes</Text>
            <Text style={styles.orderInfo}>Delivery Address: {orderDetails.delivery_address}</Text>
            <Text style={styles.orderInfo}>Status: {orderDetails.status}</Text>
            <FlatList
                data={orderDetails.order_items}
                renderItem={renderItem}
                keyExtractor={(item, index) => `item-${index}`}
                style={styles.flatList}
            />
        </View>
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
    orderInfo: {
        fontSize: 18,
        marginBottom: 5,
    },
    itemContainer: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    itemText: {
        fontSize: 18,
        marginBottom: 5,
    },
    flatList: {
        marginTop: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OrderDetailScreen;
