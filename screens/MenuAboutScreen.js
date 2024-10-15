import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { base_url } from '../constants/api';

const MenuAboutScreen = ({ route, navigation }) => {
  const { menuItemId, restaurantId } = route.params;
  console.log('menuItemId', menuItemId);
  const [menuItem, setMenuItem] = useState(null); // Single menu item
  const [recommendedItems, setRecommendedItems] = useState([]); // Other menu items from the same restaurant

  // Fetch the selected menu item details
  useEffect(() => {
    const fetchMenuItemDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = { Authorization: `Bearer ${token}` };
        const url = `${base_url}api/v1/restaurants/${restaurantId}/menu_items/`;
        const response = await axios.get(url, { headers });

        // Find the selected menu item
        const selectedItem = response.data.find(item => item.id === menuItemId);
        setMenuItem(selectedItem);

        // Filter out the current menu item for recommendations
        const recommended = response.data.filter(item => item.id !== menuItemId);
        setRecommendedItems(recommended);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItemDetails();
  }, [menuItemId, restaurantId]);

  // Render each recommended item
  const renderRecommendedItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => navigation.navigate('MenuItemDetailScreen', { menuItemId: item.id, restaurantId: item.restaurant_id })}>
        <Card style={styles.recommendedCard}>
          <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.recommendedImage} />
          <Text style={styles.recommendedName}>{item.name}</Text>
          {/* <Text style={styles.recommendedPrice}>${item.item_prices[0]}</Text> */}
        </Card>
      </TouchableOpacity>
    );
  };

  if (!menuItem) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Image source={{ uri: menuItem.image_url || 'https://via.placeholder.com/300' }} style={styles.menuImage} />
        <View style={styles.menuDetails}>
          <Text style={styles.menuTitle}>{menuItem.name}</Text>
          {/* <Text style={styles.menuPrice}>${menuItem.item_prices[0]}</Text> */}
          <View style={styles.metaDetails}>
            <Text>Free Delivery</Text>
            <Text>Cook Time: {menuItem.cook_time} mins</Text>
            <Text>Rating: 4.9</Text>
          </View>
          <Text style={styles.menuDescription}>{menuItem.description || 'No description available'}</Text>
        </View>
      </View>

      {/* Recommended Section */}
      <View style={styles.recommendedSection}>
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        <FlatList
          data={recommendedItems}
          renderItem={renderRecommendedItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    // Custom styles for top section
  },
  menuImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  menuDetails: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuPrice: {
    fontSize: 20,
    color: '#F09B00',
    marginVertical: 10,
  },
  metaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  menuDescription: {
    fontSize: 16,
    color: '#555',
  },
  recommendedSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 20,
  },
  recommendedCard: {
    margin: 10,
    width: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: 100,
  },
  recommendedName: {
    padding: 10,
    fontSize: 14,
  },
  recommendedPrice: {
    paddingLeft: 10,
    fontSize: 16,
    color: '#F09B00',
  },
});

export default MenuAboutScreen;
