import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, FlatList, Animated, Easing, SafeAreaView, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url, restuarants } from '../constants/api';
import { Icons } from '../constants/Icons';
import { COLORS } from '../constants/colors';
import { Card, Title, Paragraph, Searchbar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons'; 
const HomeScreen = ({navigation}) => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const backgroundImages = [
    require('../assets/images/Big_Sky_Resort.webp'),
    require('../assets/images/mountain.webp'),
    require('../assets/images/Big_Sky_Resort.webp'),
  ];

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await axios.get(`${base_url}${restuarants.restuarant}`, { headers });
        const restaurantsWithImages = response.data.map((restaurant, index) => ({
          ...restaurant,
          image: { url: `https://source.unsplash.com/random/800x600?restaurant&sig=${index}` },
        }));
        setRestaurants(restaurantsWithImages);

        // Select the first restaurant by default
        if (restaurantsWithImages.length > 0) {
          fetchMenuItems(restaurantsWithImages[0].id);
          setSelectedRestaurant(restaurantsWithImages[0].id);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();

    const changeBackgroundImage = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start(() => {
        setBackgroundIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.ease,
        }).start();
      });
    };

    const randomInterval = () => {
      const minInterval = 120000; // 2 minutes in milliseconds
      const maxInterval = 600000; // 10 minutes in milliseconds
      return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
    };

    const intervalId = setInterval(changeBackgroundImage, randomInterval());

    return () => clearInterval(intervalId);
  }, [fadeAnim]);

  // Fetch menu items for the selected restaurant
  const fetchMenuItems = async (restaurantId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = { Authorization: `Bearer ${token}` };
      const url = `${base_url}api/v1/restaurants/${restaurantId}/menu_items/`;
      const response = await axios.get(url, { headers });
      setMenuItems(response.data);
      console.log('menu item:', response.data)
      setSelectedRestaurant(restaurantId); // Set the selected restaurant ID
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const renderRestaurant = ({ item: restaurant }) => {
    const isSelected = selectedRestaurant === restaurant.id;
    return (
      <TouchableOpacity
        onPress={() => fetchMenuItems(restaurant.id)} // Load menu items and mark as selected
      >
        <Card
          style={[
            styles.restaurantCard,
            { backgroundColor: isSelected ? '#F09B00' : 'white' }, // Change background when selected
          ]}
        >
          <Image source={{ uri: restaurant.image.url }} style={styles.restaurantImage} />
          <Text numberOfLines={1} style={styles.restaurantTitle}>{restaurant.name}</Text>
          <Text style={styles.restaurantSubtitle}>{restaurant.address}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => {
    const price = item.item_prices?.length > 0 ? item.item_prices[0] : 'Not Available';
    const imageUrl = item.image_url || 'https://via.placeholder.com/150'; // Use placeholder if no image_url
    const rating = '4.9'; // Static rating for now, can be dynamic
    const distance = '190m'; // Static distance for now
    
    return (
      <TouchableOpacity onPress={() => navigation.navigate('MenuItemDetailScreen', { menuItemId: item.id, restaurantId: selectedRestaurant })}>
        <Card style={styles.menuCard}> 
          <View style={styles.innerCardContainer}>
            <View style={styles.menuCardTop}>
              <Image source={{ uri: imageUrl }} style={styles.menuImage} />
              <FontAwesome name="heart-o" size={24} color="white" style={styles.heartIcon} />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle} numberOfLines={1}>{item.name}</Text>
              <View style={styles.menuInfo}>
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={14} color="gold" />
                  <Text style={styles.ratingText}>{rating}</Text>
                </View>
                <View style={styles.distanceContainer}>
                  <FontAwesome name="map-marker" size={14} color="gray" />
                  <Text style={styles.distanceText}>{distance}</Text>
                </View>
              </View>
              <Text style={styles.priceText}>${price}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ImageBackground
          source={require('../assets/images/homeImage.png')} // Header image
          style={styles.backgroundImage}
        >
          <View style={styles.titleOverlay}>
            <View style={styles.notification}>
              <View>
                <TouchableOpacity style={styles.locationContainer}>
                  <Text style={styles.locationText}>Your Location</Text>
                  <Icons.DownwardArrow />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icons.LocationIcon />
                  <Text style={styles.locationSubtext}>Your Location</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Icons.NotificationIcon />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Provide the best {'\n'}food for you</Text>
          </View>
        </ImageBackground>
      </Animated.View>

      <View style={{ flex: 1, marginTop: 10 }}>
        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          horizontal // To make the list horizontally scrollable
          showsHorizontalScrollIndicator={false} // Hides the horizontal scroll indicator
          contentContainerStyle={styles.horizontalListContainer}
        />

        <FlatList
          data={menuItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // Display two columns of menu items
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListEmptyComponent={<Text>No menu items available</Text>}
        />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: 230,
  },
  titleOverlay: {
    padding: 20,
    top: 50,
  },
  notification: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.white,
    //fontFamily: 'Lato-Regular',
  },
  dropdownArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  locationSubtext: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 5,
    //fontFamily: 'Lato-Regular',
  },
  subtitle: {
    fontSize: 32,
    color: COLORS.white,
    top: 25,
    //fontFamily: 'Lato-Bold',
  },
  horizontalListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 60
  },
  restaurantCard: {
    width: 120,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  restaurantTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  restaurantSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  searchBar: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  card: {
    margin: 8,
    elevation: 4,
  },
  menuCard: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    width: 170, // Adjust based on your design requirements
  },
  innerCardContainer: {
    overflow: 'hidden', // Apply overflow to the inner container
    borderRadius: 10, // Match the border radius of the card
  },
  menuCardTop: {
    position: 'relative',
  },
  menuImage: {
    width: '100%',
    height: 100,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  menuDetails: {
    padding: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F09B00',
  },
});

export default HomeScreen;


