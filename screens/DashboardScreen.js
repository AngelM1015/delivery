import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Switch,
} from "react-native";
import { Card } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { base_url } from "../constants/api";
import useRestaurants from "../hooks/useRestaurants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DashboardScreen = ({ navigation }) => {
  const {
    fetchMenuItems,
    changeStatus,
    menuItems,
    setMenuItems,
    restaurants,
    loading,
    selectedRestaurant,
    setSelectedRestaurant,
    getResturantByOwner,
  } = useRestaurants();
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        setUserId(userId);
      } catch (err) {
        setError("Failed to fetch user ID");
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      getResturantByOwner(userId)
        .then((fetchedRestaurants) => {
          if (fetchedRestaurants.length > 0) {
            setSelectedRestaurant(fetchedRestaurants[0].id);
          }
        })
        .catch((err) => {
          setError("Failed to fetch restaurants");
        });
    }
  }, [userId]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const renderRestaurantItem = ({ item: restaurant }) => {
    const isSelected = selectedRestaurant === restaurant.id;
    const image_url = base_url + restaurant.image_url;
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
          <Text style={styles.restaurantSubtitle}>{restaurant.address}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => {
    const price =
      item.item_prices?.length > 0 ? item.item_prices[0] : "Not Available";
    const imageUrl = item.image_url
      ? base_url + item.image_url
      : "https://via.placeholder.com/150";
    const rating = "4.9"; // Static rating for now, can be dynamic
    const distance = "2km"; // Static distance for now

    const toggleSwitch = () => {
      changeStatus(selectedRestaurant, item.id, !item.isenabled);
      setMenuItems((prevItems) =>
        prevItems.map((menu) =>
          menu.id === item.id ? { ...menu, isenabled: !menu.isenabled } : menu
        )
      );
    };

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("MenuAboutScreen", {
            menuItemId: item.id,
            restaurantId: item.restaurant_id,
          })
        }
      >
        <Card style={styles.menuCard}>
          <View style={styles.innerCardContainer}>
            <View style={styles.menuCardTop}>
              <Image source={{ uri: imageUrl }} style={styles.menuImage} />
              <View style={styles.switchContainer}>
                <Switch
                  trackColor={{ false: "#767577", true: "#F09B00" }}
                  thumbColor={item.isenabled ? "#ffffff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={item.isenabled}
                  style={styles.switch}
                />
              </View>
            </View>
            <View style={styles.menuDetails}>
              <Text style={styles.menuTitle} numberOfLines={1}>
                {item.name}
              </Text>
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  const selectedRestaurantObject = restaurants.find(
    (restaurant) => restaurant.id === selectedRestaurant
  );

  return (
    <SafeAreaView style={styles.container}>
      {selectedRestaurantObject && (
        <Image
          source={{ uri: base_url + selectedRestaurantObject.image_url }}
          style={styles.masterImage}
        />
      )}
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContainer}
      />

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListEmptyComponent={<Text>No menu items available</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  masterImage: {
    width: "100%",
    height: "25%",
    resizeMode: "cover",
  },
  horizontalListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  restaurantCard: {
    width: 120,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  restaurantImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  restaurantTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  restaurantSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  menuCard: {
    flex: 1,
    margin: 10,
    padding: 6,
    borderRadius: 10,
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
  menuInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#000",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#000",
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#F09B00",
  },
  iconContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 10,
    top: 10,
  },
  editIcon: {},
  switchContainer: {
    alignItems: "center",
    position: "absolute",
  },
  addNewProduct: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
});

export default DashboardScreen;
