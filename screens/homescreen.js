import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem('userToken');
        // Include the token in the header for the request
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        
        const response = await axios.get('http://localhost:3000/api/v1/restaurants', { headers });
        const restaurantsWithImages = response.data.map((restaurant, index) => ({
          ...restaurant,
          image: { url: `https://source.unsplash.com/random/800x600?restaurant&sig=${index}` },
        }));
        setRestaurants(restaurantsWithImages);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  const renderRestaurant = ({ item: restaurant, index }) => {
    return (
      <TouchableOpacity
        style={styles.restaurantContainer}
        onPress={() => navigation.navigate('RestaurantMenuScreen', { restaurantId: restaurant.id })}
      >
        <ImageBackground
          source={{ uri: restaurant.image.url }}
          style={styles.restaurantImage}
        >
          <View style={styles.restaurantOverlay}>
            <Text style={styles.restaurantTitle}>{restaurant.name}</Text>
            <Text style={styles.restaurantSubtitle}>{restaurant.address}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={restaurants}
      renderItem={renderRestaurant}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1517659649778-bae24b8c2e26?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9' }}
          style={styles.backgroundImage}
        >
          <View style={styles.titleOverlay}>
            <Text style={styles.title}>BigSkyEats</Text>
            <Text style={styles.subtitle}>Delicious meals delivered to your door, snow or shine.</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('RestaurantMenuScreen')}
              >
              <Text style={styles.buttonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      }
      ListHeaderComponentStyle={styles.backgroundImage}
    />
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: 250, // fixed height for the background image header
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  titleOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    padding: 20,
  },
  restaurantContainer: {
    height: 200, // fixed height for restaurant images
    marginBottom: 10,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  restaurantOverlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ff3366',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  restaurantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  restaurantSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default HomeScreen;