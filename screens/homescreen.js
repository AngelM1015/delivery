import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, FlatList, Animated, Easing, SafeAreaView, Image } from 'react-native';
import { base_url } from '../constants/api';
import { Icons } from '../constants/Icons';
import { COLORS } from '../constants/colors';
import { Card } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import useRestaurants from '../hooks/useRestaurants';

const HomeScreen = ({navigation}) => {
  const { loading, restaurants, menuItems, selectedRestaurant, setSelectedRestaurant, fetchRestaurants, fetchMenuItems } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState('');
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const backgroundImages = [
    require('../assets/images/Big_Sky_Resort.webp'),
    require('../assets/images/mountain.webp'),
    require('../assets/images/Big_Sky_Resort.webp'),
  ];

  useEffect(() => {
    console.log('restaurant', restaurants);
  
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

  const renderRestaurant = ({ item: restaurant }) => {
    const isSelected = selectedRestaurant === restaurant.id;
    const image_url = base_url + restaurant.image_url;
    console.log('image url', image_url);
    return (
      <TouchableOpacity
        onPress={() => setSelectedRestaurant(restaurant.id)} // Load menu items and mark as selected
      >
        <Card
          style={[
            styles.restaurantCard,
            { backgroundColor: isSelected ? '#F09B00' : 'white', justifyContent:'center',alignItems:'center' }, // Change background when selected
          ]}
        >
          <Image source={{ uri: image_url}} style={styles.restaurantImage} />
          <Text numberOfLines={1} style={styles.restaurantTitle}>{restaurant.name}</Text>
          <Text style={styles.restaurantSubtitle}>{restaurant.address}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => {
    const price = item.item_prices?.length > 0 ? item.item_prices[0] : 'Not Available';
    const imageUrl = item.image_url ? base_url + item.image_url : 'https://via.placeholder.com/150'
    const rating = '4.9'; // Static rating for now, can be dynamic
    const distance = '2km'; // Static distance for now

    return (
      <TouchableOpacity onPress={() => navigation.navigate('MenuAboutScreen', { menuItemId: item.id, restaurantId: item.restaurant_id })}>
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
          source={require('../assets/images/homeImage.png')}
          style={styles.backgroundImage}
        >
          {/* <Searchbar
            placeholder="Search Menu Items"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          /> */}
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
          horizontal 
          showsHorizontalScrollIndicator={false} 
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
  },
  subtitle: {
    fontSize: 32,
    color: COLORS.white,
    top: 25,
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
    width: 100,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf:'center'
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
    padding: 6,
    borderRadius: 10,
    borderWidth: 0.1,
    shadowOpacity: 0,
    backgroundColor: '#fff',
    elevation: 3,
    width: 180,
  },
  innerCardContainer: {
    overflow: 'hidden',
    borderRadius: 10,
    gap: 8
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
    padding: 2,
    gap: 4
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
