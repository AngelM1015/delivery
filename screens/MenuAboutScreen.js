import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { base_url } from '../constants/api';
import { useCart } from '../context/CartContext';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import Header from '../components/Header';
import Toast from 'react-native-toast-message';

const MenuAboutScreen = ({ route, navigation }) => {
  const { menuItemId, restaurantId } = route.params;
  const [menuItem, setMenuItem] = useState(null);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [modifierCounts, setModifierCounts] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [modifiers, setModifiers] = useState([]);
  const { addToCart, clearCart, cartRestaurantId, setCartRestaurantId } = useCart();

  useEffect(() => {
    const fetchMenuItemDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = { Authorization: `Bearer ${token}` };
        const url = `${base_url}api/v1/restaurants/${restaurantId}/menu_items/${menuItemId}`;
        const response = await axios.get(url, { headers });
        console.log('menu item', response.data);

        setMenuItem(response.data.menu_item);
        setModifiers(response.data.modifiers);

        // Initialize modifier counts
        const initialCounts = (response.data.modifiers || []).reduce((counts, modifier) => {
          counts[modifier.id] = {};
          (modifier.modifier_options || []).forEach(option => {
            counts[modifier.id][option.id] = 0;
          });
          return counts;
        }, {});
        setModifierCounts(initialCounts);

        // Set recommended items excluding the selected item
        // const recommended = response.data.filter(item => item.id !== menuItemId);
        // setRecommendedItems(recommended);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItemDetails();
  }, [menuItemId, restaurantId]);


  const handleAddToCart = () => {
    AsyncStorage.setItem('selectedRestaurantId', `${restaurantId}`);

    const selectedModifiers = Object.entries(modifierCounts)
      .map(([modifierId, optionsCounts]) => ({
        modifierId,
        options: Object.entries(optionsCounts)
          .filter(([_, count]) => count > 0)
          .map(([optionId, count]) => {
            const option = modifiers
              ?.find(modifier => modifier.id === parseInt(modifierId))?.modifier_options
              ?.find(option => option.id === parseInt(optionId));
            return { ...option, count };
          })
      }))
      .filter(modifier => modifier.options.length > 0);

    // Safely access item_prices
    const price = menuItem.item_prices?.length > 0 ? parseFloat(menuItem.item_prices[0]) : '0.0';

    // Ensure the imageUrl is correctly set
    const imageUrl = menuItem.image_url
      ? base_url + menuItem.image_url
      : 'https://via.placeholder.com/150';
    console.log('Image URL:', imageUrl); // Log the image URL before adding

    const itemForCart = {
      id: menuItemId,
      name: menuItem.name,
      price: price + selectedModifiers.reduce((w, x) => w + x.options.reduce((a, b) => a + parseFloat(b.additional_price * b.count), 0), 0),
      imageUrl,
      selectedModifiers,
      quantity: quantity,
    };

    console.log('Item being added to cart:', itemForCart);
    if(cartRestaurantId !== menuItem.restaurant_id)
      {
        clearCart();
        setCartRestaurantId(menuItem.restaurant_id);
        addToCart(itemForCart);
      }
    else{
      addToCart(itemForCart);
    }
    Toast.show({
      type: 'success',
      text1: 'Success!',
      text2: 'Item added to the cart 👋',
      position: 'top',
      visibilityTime: 1000,
    });
  };

  const handleQuantityChange = (modifierId, optionId, increment) => {
    setModifierCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      const currentCount = newCounts[modifierId]?.[optionId] || 0;
      newCounts[modifierId] = {
        ...newCounts[modifierId],
        [optionId]: increment ? currentCount + 1 : Math.max(currentCount - 1, 0),
      };
      return newCounts;
    });
  };

  const renderRecommendedItem = ({ item }) => {
    const imageUrl = menuItem.image_url
    ? base_url + menuItem.image_url
    : 'https://via.placeholder.com/150';
    const price = item.item_prices?.length > 0 ? item.item_prices[0] : 'Not Available';
    const rating = '4.9';
    const distance = '2km';

    return (
      <TouchableOpacity onPress={() => navigation.navigate('MenuItemDetailScreen', { menuItemId: item.id, restaurantId: item.restaurant_id })}>
        <Card style={styles.recommendedCard}>
          <View style={styles.innerCardContainer}>
            <View style={styles.menuCardTop}>
              <Image source={{ uri: imageUrl }} style={styles.recommendedImage} />
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

  if (!menuItem) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F09B00" />
      </View>
    );
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <Header title="About This Menu" navigation={navigation} showShareIcon={true} />

      {/* Main Content */}
      <ScrollView>
        <View style={styles.topSection}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: menuItem.image_url ? base_url + menuItem.image_url : 'https://via.placeholder.com/300' }} style={styles.menuImage} />
          </View>
          <View style={styles.menuDetails}>
            <Text style={styles.menuTitle}>{menuItem.name}</Text>
            <Text style={styles.priceText}>${menuItem.item_prices ? menuItem.item_prices[0] : 0}</Text>
            <View style={styles.metaDetails}>
              <Text><FontAwesome name='bicycle' color='#F09B00'/> Free Delivery</Text>
              <Text><FontAwesome name='clock-o' color='#F09B00'/> {menuItem.cook_time} mins</Text>
              <Text><FontAwesome name='star' color='#F09B00'/> 4.9</Text>
            </View>
            <View style={styles.separator} />
            <Text>Description</Text>
            <Text style={styles.menuDescription}>{menuItem.description || 'No description available'}</Text>
          </View>
        </View>

        {modifiers.length > 0 && (
          <View>
            <Text style={styles.modifiersTitle}>Available Modifiers:</Text>
            {modifiers.map(modifier => (
              <Card key={modifier.id} style={styles.card}>
                <Card.Title title={modifier.name} />
                <Card.Content>
                  {(modifier.modifier_options || []).map(option => (
                    <View key={option.id} style={styles.optionContainer}>
                      <Text>{option.name} (+${option.additional_price || '0.00'})</Text>
                      <View style={styles.counterContainer}>
                        <TouchableOpacity onPress={() => handleQuantityChange(modifier.id, option.id, false)}>
                        <AntDesign name="minus" size={20} />
                        </TouchableOpacity>
                        <Text style={styles.countText}>{modifierCounts[modifier.id]?.[option.id] || 0}</Text>
                        <TouchableOpacity onPress={() => handleQuantityChange(modifier.id, option.id, true)}>
                        <AntDesign name="plus" size={20} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            ))}
        </View>
        )}

        {/* Recommended Section */}
        {/* <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <FlatList
            data={recommendedItems}
            renderItem={renderRecommendedItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View> */}
      </ScrollView>

      {/* Footer - Quantity and Add to Cart */}
      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityIcon} onPress={decrementQuantity}>
            <AntDesign name="minus" size={30} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityIcon} onPress={incrementQuantity}>
            <AntDesign name="plus" size={30} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}><FontAwesome name="shopping-cart" size={20} color='white'/>  Add To Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topSection: {
    paddingTop: 10,
  },
  menuImage: {
    width: '95%',
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
  priceText: {
    fontSize: 20,
    color: '#F09B00',
    marginVertical: 10,
  },
  separator: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
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
    flex: 1,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    width: 170,
  },
  innerCardContainer: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  menuCardTop: {
    position: 'relative',
  },
  recommendedImage: {
    width: '100%',
    height: 100,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5',
    padding: 5,
  },
  quantityIcon: {
    borderRadius: '50',
    borderColor: '#C0C0C0',
    borderWidth: '0.5',
    padding: '30'
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  modifiersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: '#F09B00',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  addToCartText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MenuAboutScreen;
