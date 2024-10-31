import React, { useState, useEffect } from "react";
import { FlatList } from "react-native";
import { Card, Title, Paragraph, Searchbar } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url } from "../constants/api";
const RestaurantMenuScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        const headers = { Authorization: `Bearer ${token}` };
        const url = `${base_url}api/v1/restaurants/${restaurantId}/menu_items/`;
        const response = await axios.get(url, { headers });
        setMenuItems(response.data);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId]);

  const filteredMenuItems = searchQuery
    ? menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  const handleSelectItem = (item) => {
    navigation.navigate("MenuItemDetailScreen", {
      menuItemId: item.id,
      restaurantId: restaurantId,
    });
  };

  const renderItem = ({ item }) => {
    const price =
      item.item_prices?.length > 0 ? item.item_prices[0] : "Not Available";
    return (
      <Card style={styles.card} onPress={() => handleSelectItem(item)}>
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph>{item.description}</Paragraph>
          <Paragraph>Price: ${price}</Paragraph>
        </Card.Content>
      </Card>
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <Searchbar
          placeholder="Search Menu Items"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      }
      data={filteredMenuItems}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = {
  card: {
    margin: 8,
    elevation: 4,
  },
};

export default RestaurantMenuScreen;
