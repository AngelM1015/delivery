import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  SafeAreaView,
  Image,
} from "react-native";
import { base_url } from "../constants/api";
import { Icons } from "../constants/Icons";
import { COLORS } from "../constants/colors";
import { Card } from "react-native-paper";
import { FontAwesome, Fontisto } from "@expo/vector-icons";
import useRestaurants from "../hooks/useRestaurants";
import Locations from "../components/Locations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../client";
import * as Location from 'expo-location'
import { GOOGLE_MAPS_API_KEY } from "@env";
import axios from "axios";
import useAddress from "../hooks/useAddress";
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const {
    loading,
    restaurants,
    menuItems,
    selectedRestaurant,
    setSelectedRestaurant,
    fetchRestaurants,
    fetchMenuItems,
  } = useRestaurants();
  const {addresses, addAddress} = useAddress();
  const [searchQuery, setSearchQuery] = useState("");
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [distances, setDistances] = useState({});

  const backgroundImages = [
    require("../assets/images/Big_Sky_Resort.webp"),
    require("../assets/images/mountain.webp"),
    require("../assets/images/Big_Sky_Resort.webp"),
  ];

  useFocusEffect(() => {
    if (selectedRestaurant === null) {
      fetchRestaurants;
    }
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await AsyncStorage.getItem("location");
        if (location) {
          const parsedLocation = JSON.parse(location);
          setSelectedLocation(parsedLocation);
        }
      } catch (error) {
        console.log("Error fetching location:", error);
      }
    };
    getLocation();
    const changeBackgroundImage = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start(() => {
        setBackgroundIndex(
          (prevIndex) => (prevIndex + 1) % backgroundImages.length
        );
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.ease,
        }).start();
      });
    };

    const randomInterval = () => {
      const minInterval = 120000;
      const maxInterval = 600000;
      return (
        Math.floor(Math.random() * (maxInterval - minInterval + 1)) +
        minInterval
      );
    };

    const intervalId = setInterval(changeBackgroundImage, randomInterval());

    return () => clearInterval(intervalId);
  }, [fadeAnim]);

  useEffect(() => {
    if(selectedLocation !== null)
      calculateDistance(selectedLocation);
    else
      if(addresses.length > 0) setCurrentLocation();
  }, [selectedLocation, addresses])

  const handleSelectLocation = (location) => {
    console.log("location", location);
    setSelectedLocation(location);
    setLocationModalVisible(false);
  };

  const calculateDistance = async (location) => {

    const token = AsyncStorage.getItem('userToken');
    const url = `api/v1/restaurants/fetch_restaurants_mileage`
    const restaurant = {
      destination_latitude: location.latitude,
      destination_longitude: location.longitude
    }

    try {
      const response = await client.get(url,
        { params: {
          restaurant
        },
          Header: { Authorization: `Bearer ${token}` }
        }
      )
      console.log('distance response', response.data);

      setDistances(response.data);
    } catch (error) {
        console.error("Error fetching distance:", error);
        return;
    }
  };

  const setCurrentLocation = async () => {
    const currentLocation = await Location.getCurrentPositionAsync();

    try {
      const currentLat = currentLocation.coords.latitude;
      const currentLng = currentLocation.coords.longitude;

      for (const address of addresses) {
        const isWithinRadius = await checkProximity(
          { lat: currentLat, lng: currentLng },
          { lat: address.latitude, lng: address.longitude }
        );

        if (isWithinRadius) {
          console.log('Address within 50 meters:', address);
          setSelectedLocation(address);
          await AsyncStorage.setItem("location", JSON.stringify(address));

          return;
        }
      }

      console.log('current location lat and long in home screen ', { lat: currentLat, long: currentLng});
      const newAddress = await addAddress(currentLat, currentLng);
      setSelectedLocation(newAddress);
      await AsyncStorage.setItem("location", JSON.stringify(newAddress));

      console.log('No addresses within 50 meters of the current location.');
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const checkProximity = async (currentLocation, savedLocation) => {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${currentLocation.lat},${currentLocation.lng}&destinations=${savedLocation.lat},${savedLocation.lng}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await axios.get(url);
      if(!response.data.rows[0].elements[0].distance) return false;

      const distanceInMeters = response.data.rows[0].elements[0].distance.value;

      console.log(`Distance to saved location: ${distanceInMeters} meters`);
      return distanceInMeters <= 50;
    } catch (error) {
      console.error('Error checking distance:', error);
      return false;
    }
  };

  const renderRestaurant = ({ item: restaurant }) => {
    const isSelected = selectedRestaurant === restaurant.id;
    const image_url = base_url + restaurant.image_url;
    const distance = distances[restaurant.id] ? `${distances[restaurant.id].distance.toFixed(1)}km` : "2km";
    const deliveryPrice = distances[restaurant.id] ? distances[restaurant.id].delivery_price : 15;

    return (
      <TouchableOpacity onPress={() => setSelectedRestaurant(restaurant.id)}>
        <Card
          style={[
            styles.restaurantCard,
            {
              backgroundColor: isSelected ? "#F09B00" : "white",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Image source={{ uri: image_url }} style={styles.restaurantImage} />
          <Text numberOfLines={1} style={styles.restaurantTitle}>
            {restaurant.name}
          </Text>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}><FontAwesome name="map-marker" size={14} color="gray" /> {distance}</Text>
            <Text style={styles.distanceText}><Fontisto name="motorcycle" size={14} color="black" /> ${deliveryPrice}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => {
    const price = item.item_prices?.length > 0 ? item.item_prices[0] : "Not Available";
    const imageUrl = item.image_url
      ? base_url + item.image_url
      : "https://via.placeholder.com/150";
    const deliveryPrice = distances[item.restaurant_id] ? distances[item.restaurant_id].delivery_price : 15;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("MenuAboutScreen", {
            menuItemId: item.id,
            restaurantId: item.restaurant_id,
            deliveryFee: deliveryPrice
          })
        }
      >
        <Card style={styles.menuCard}>
          <View style={styles.innerCardContainer}>
            <View style={styles.menuCardTop}>
              <Image source={{ uri: imageUrl }} style={styles.menuImage} />
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle} numberOfLines={1}>
                {item.name}
              </Text>
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
          source={require("../assets/images/homeImage.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.titleOverlay}>
            <View style={styles.notification}>
              <View>
                <TouchableOpacity
                  style={styles.locationContainer}
                  onPress={() => setLocationModalVisible(true)}
                >
                  <Text style={{ color: "white" }}>
                    {selectedLocation ? "Change Location" : "Your Location"}
                  </Text>
                  <Icons.DownwardArrow />
                </TouchableOpacity>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <Icons.LocationIcon />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {selectedLocation
                      ? selectedLocation.location_name
                      : "Your Location"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity>
                <Icons.NotificationIcon />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Provide the best {"\n"}food for you
            </Text>
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
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={<Text>No menu items available</Text>}
        />
      </View>
      <Locations
        isVisible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelectLocation={handleSelectLocation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: 230,
  },
  titleOverlay: {
    padding: 20,
    top: 50,
  },
  notification: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "400",
    color: COLORS.white,
    maxWidth: "80%",
  },
  dropdownArrow: {
    fontSize: 18,
    color: "#FFFFFF",
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
    marginTop: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    minHeight: '45%',
    maxHeight: '45%'
  },
  restaurantCard: {
    width: 120,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    minHeight: 160,
    maxHeight: 160,
  },
  restaurantImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
    alignSelf: "center",
  },
  restaurantTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
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
    backgroundColor: "#fff",
    elevation: 3,
    width: 180,
  },
  innerCardContainer: {
    overflow: "hidden",
    borderRadius: 10,
    gap: 8,
  },
  menuCardTop: {
    position: "relative",
  },
  menuImage: {
    width: "100%",
    height: 100,
  },
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  menuDetails: {
    padding: 2,
    gap: 4,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  distanceContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginTop: 14,
  },
  distanceText: {
    fontSize: 12,
    color: "#000",
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#F09B00",
  }
});

export default HomeScreen;
