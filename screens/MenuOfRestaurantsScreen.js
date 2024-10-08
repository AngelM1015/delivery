import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuOfRestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        const response = await axios.get('http://localhost:3000/api/v1/restaurants', { headers });
        const restaurantsWithImages = response.data.map((restaurant) => ({
          ...restaurant,
          image: restaurant.image_url ? { uri: restaurant.image_url } : null,
        }));
        if (restaurantsWithImages.length % 2 !== 0) {
          restaurantsWithImages.push({ id: -1 });
        }
        setRestaurants(restaurantsWithImages);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  const renderItem = ({ item }) => {
    if (item.id === -1) {
      return <View style={[styles.card, { backgroundColor: 'transparent' }]} />;
    }

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('RestaurantMenuScreen', { restaurantId: item.id })}
      >
        {item.image ? (
          <Image source={item.image} style={styles.cardImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardText}>{item.address}</Text>
          <Text>delivery fee: $20</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={restaurants}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.menuList}
      numColumns={2}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuList: {
    alignItems: 'center',
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 6,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  noImageContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  noImageText: {
    color: '#666',
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default MenuOfRestaurantsScreen;
