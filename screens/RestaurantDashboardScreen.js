import React, { useState, useEffect } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  SafeAreaView,
  Switch,
} from "react-native";
import { Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRestaurants from "../hooks/useRestaurants";
import { base_url } from "../constants/api";
import client from "../client";

const DashboardScreen = () => {
  const [role, setRole] = useState(null);
  const {
    selectedRestaurant,
    menuItems,
    restaurants,
    fetchRestaurants,
    setSelectedRestaurant,
    setMenuItems,
  } = useRestaurants();

  const [backgroundImage, setBackgroundImage] = useState(
    "https://via.placeholder.com/150",
  );

  useEffect(() => {
    const fetchRoleAndData = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setRole(role);
      if (role === "restaurant_owner") {
        if (selectedRestaurant === null) {
          console.log("in home screen use effetc");
          fetchRestaurants;
        }
      } else {
        await fetchData(role);
      }
    };

    fetchRoleAndData();
  }, []);

  const renderRestaurant = ({ item: restaurant }) => {
    console.log("restaurants in dashboard ", restaurants);
    const isSelected = selectedRestaurant === restaurant.id;
    const image_url = base_url + restaurant.image_url;
    if (isSelected) {
      setBackgroundImage(image_url);
    }

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

    return (
      <Card style={styles.menuCard}>
        <View style={styles.innerCardContainer}>
          <View style={styles.menuCardTop}>
            <Image source={{ uri: imageUrl }} style={styles.menuImage} />
            <View style={styles.switchContainer}>
              <Switch
                trackColor={{ false: "#767577", true: "#F09B00" }}
                thumbColor={item.isenabled ? "#ffffff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(item)}
                value={item.isenabled}
                style={styles.switch}
              />
            </View>
          </View>
          <View style={styles.menuDetails}>
            <Text style={styles.menuTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.priceText}>$ {price}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const toggleSwitch = async (item) => {
    item.isenabled = !item.isenabled;

    setMenuItems((prevItems) =>
      prevItems.map((menu) =>
        menu.id === item.id ? { ...menu, isenabled: item.isenabled } : menu,
      ),
    );
    try {
      const token = await AsyncStorage.getItem("userToken");
      const endpoint = `restaurants/${selectedRestaurant}/menu_items/${item.id}/enable_menu_item`;

      const response = await client.patch(
        `api/v1/${endpoint}`,
        { menu_item: item },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("new value of enabled", item.isenabled);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const renderDashboard = () => {
    // if (loading) {
    //   return <Text>Loading...</Text>;
    // }
    return (
      <SafeAreaView>
        <Image
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
        />
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
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            ListEmptyComponent={<Text>No menu items available</Text>}
          />
        </View>
      </SafeAreaView>
    );
  };

  return <ScrollView style={styles.container}>{renderDashboard()}</ScrollView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: "#f0f0f0",
  },
  backgroundImage: {
    width: "95%",
    height: 230,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  restaurantCard: {
    width: 120,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginStart: 10,
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
    color: "gray",
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
  },
  innerCardContainer: {
    overflow: "hidden",
    borderRadius: 10,
  },
  menuCardTop: {
    position: "relative",
  },
  menuImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  menuDetails: {
    padding: 2,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  switchContainer: {},
  switch: {
    top: -110,
    left: 8,
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#F09B00",
  },
});

export default DashboardScreen;
