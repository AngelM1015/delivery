import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { UserContext } from '../context/UserContext';  // Adjust the import path
import cable from '../cable';

const LiveOrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const { userId } = useContext(UserContext);

    useEffect(() => {
        if (!userId) return;

        console.log(`Subscribing to channel with user ID: ${userId}`);
        const subscription = cable.subscriptions.create(
            { channel: 'ApplicationCable::UserChannel', user_id: userId },
            {
                connected() {
                    console.log(`Connected to channel with user ID: ${userId}`);
                },
                disconnected() {
                    console.log(`Disconnected from channel with user ID: ${userId}`);
                },
                received(data) {
                    console.log('Live Received data:', data);
                    if (data.orders) {
                        console.log("Updating orders with new data.");
                        setOrders(data.orders);  // Update the orders state with new data
                    } else {
                        console.log("No orders data found in the received data.");
                    }
                }
            }
        );

        return () => {
            console.log(`Unsubscribing from channel with user ID: ${userId}`);
            subscription.unsubscribe();
        };
    }, [userId]);  // Dependency on userId to re-subscribe on change

    return (
        <ScrollView style={styles.container}>
            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <View key={index} style={styles.orderCard}>
                        <Text style={styles.title}>Order #{order.id}</Text>
                        <Text>Status: {order.status.replace(/_/g, ' ')}</Text>
                        <Text>Total Price: ${order.total_price || 'N/A'}</Text>
                        <Text>Estimated Wait Time: {order.estimated_wait_time} mins</Text>
                        <Text>Delivery Address: {order.delivery_address}</Text>
                        {order.order_items && (
                            <View>
                                <Text style={styles.subTitle}>Items:</Text>
                                {order.order_items.map((item, idx) => (
                                    <Text key={idx}>- {item.menu_item_id} x {item.quantity}</Text>
                                ))}
                            </View>
                        )}
                    </View>
                ))
            ) : (
                <Text style={styles.noOrders}>No live orders at the moment.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    orderCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
    },
    noOrders: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    }
});

export default LiveOrdersScreen;
