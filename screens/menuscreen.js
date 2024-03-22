import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        const response = await axios.get('http://localhost:3000/api/v1/restaurants', { headers });
        // Add a random Unsplash image to each restaurant
        const restaurantsWithImages = response.data.map((restaurant, index) => ({
          ...restaurant,
          image: { uri: `https://source.unsplash.com/random/300x300?restaurant&sig=${index}` },
        }));
        setRestaurants(restaurantsWithImages);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('RestaurantMenuScreen', { restaurantId: item.id })}
    >
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardText}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={restaurants}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.menuList}
      numColumns={2} // Set grid to two columns
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
    margin: 8,
    width: '45%', // Adjust the width according to your screen size and desired number of columns
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120, // Fixed height for images, you can adjust it
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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

export default MenuScreen;
