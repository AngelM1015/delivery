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

const DashboardScreen = ({ navigation }) => {
  const { fetchMenuItems, menuItems, loading } = useRestaurants();
  const [error, setError] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetchMenuItems(10);
  }, []);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const renderMenuItem = ({ item }) => {
    const price =
      item.item_prices?.length > 0 ? item.item_prices[0] : "Not Available";
    const imageUrl = item.image_url
      ? base_url + item.image_url
      : "https://via.placeholder.com/150";
    const rating = "4.9"; // Static rating for now, can be dynamic
    const distance = "2km"; // Static distance for now

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
                  thumbColor={isEnabled ? "#ffffff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                  style={styles.switch}
                />
              </View>
              <View style={styles.iconContainer}>
                <FontAwesome
                  name="edit"
                  size={24}
                  color="#F09B00"
                  style={styles.editIcon}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.addNewProduct}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddMenuScreen")}
          style={{
            backgroundColor: "#F09B00",
            padding: 10,
            borderRadius: 15,
          }}
        >
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{
            color: "#000",
            marginLeft: 10,
            fontWeight: "500",
          }}
        >
          Add Product
        </Text>
      </View>
      <View
        style={{
          padding: 10,
          borderRadius: 10,
          margin: 10,
          alignItems: "start",
        }}
      >
        <Text style={{ color: "#000", fontSize: 15 }}>Product List</Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} // Display two columns of menu items
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
    borderRadius: 24, // Half of the size to make it circular
    padding: 5, // Adjust padding as needed
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
