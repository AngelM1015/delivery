import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RestaurantScreen = ({ navigation }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            setError('');
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const headers = {
                    'Authorization': `Bearer ${userToken}`
                };
                const response = await axios.get('http://192.168.150.27:3000/api/v1/restaurants', { headers });
                setRestaurants(response.data);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
                setError('Failed to load restaurants');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);
    
    if (loading) {
        return <Text>Loading...</Text>;
    }
    
    if (error) {
        return <Text>{error}</Text>;
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('RestaurantMenuScreen', { restaurantId: item.id })}>
            <Ionicons name="restaurant" size={24} style={styles.icon} />
            <Text style={styles.menuText}>{item.name}</Text>
        </TouchableOpacity>
    );
};

export default RestaurantScreen;
