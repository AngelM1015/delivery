import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ScrollView, View, Image, StyleSheet, Text } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, Button, Provider as PaperProvider } from 'react-native-paper';
import { useCart } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3000';

const MenuItemImage = ({ menuItemDetails }) => {
  const imageUrl = `${BASE_URL}${menuItemDetails.image_url}`;
  return menuItemDetails.image_url ? (
    <Image source={{ uri: imageUrl }} style={styles.image} />
  ) : null;
};

const MenuItemDetailScreen = ({ route }) => {
  const { restaurantId, menuItemId } = route.params;
  const { userRole } = useContext(UserContext);
  const [menuItemDetails, setMenuItemDetails] = useState(null);
  const [modifierCounts, setModifierCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifiers, setModifiers] = useState([]);
  const [modifierOptions, setModifierOptions] = useState([]);

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const url = `${BASE_URL}/api/v1/restaurants/${restaurantId}/menu_items/${menuItemId}`;
        console.log(`Fetching menu item from: ${url}`);
        const response = await axios.get(url);
        console.log('Response data:', response.data);
        if (!response.data) {
          throw new Error('No data received');
        }
        setMenuItemDetails(response.data);
        const initialCounts = (response.data.modifiers || []).reduce((counts, modifier) => {
          counts[modifier.id] = {};
          (modifier.modifier_options || []).forEach(option => {
            counts[modifier.id][option.id] = 0;
          });
          return counts;
        }, {});
        setModifierCounts(initialCounts);
      } catch (err) {
        setError(err.message || 'Failed to load menu item. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItem();
  }, [restaurantId, menuItemId]);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    AsyncStorage.setItem('selectedRestaurantId', `${restaurantId}`);
    console.log('Modifier Counts:', modifierCounts);
    console.log('Menu Item Details:', menuItemDetails);
    const selectedModifiers = Object.entries(modifierCounts)
      .map(([modifierId, optionsCounts]) => ({
        modifierId,
        options: Object.entries(optionsCounts)
          .filter(([_, count]) => count > 0)
          .map(([optionId, count]) => {
            const option = menuItemDetails.modifiers
              .find(modifier => modifier.id === parseInt(modifierId)).modifier_options
              .find(option => option.id === parseInt(optionId));
            return { ...option, count };
          })
      }))
      .filter(modifier => modifier.options.length > 0);

    const price = menuItemDetails.item_prices.length > 0 ? parseFloat(menuItemDetails.item_prices[0]) : '0.0'

    const itemForCart = {
      id: menuItemId,
      name: menuItemDetails.name,
      price: price + selectedModifiers.reduce((w,x)=> w + x.options.reduce((a,b) => a + parseFloat(b.additional_price * b.count), 0), 0),
      selectedModifiers,
      quantity: 1
    };

    addToCart(itemForCart);
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

  if (isLoading) {
    return <ActivityIndicator animating={true} />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!menuItemDetails) {
    return <Text>Menu item not found.</Text>;
  }

  return (
    <PaperProvider>
      <ScrollView>
        <MenuItemImage menuItemDetails={menuItemDetails} />
        <Title style={styles.title}>{menuItemDetails.name}</Title>
        <Paragraph style={styles.description}>{menuItemDetails.description}</Paragraph>
        {(menuItemDetails.modifiers || []).length === 0 ? (
          <Text style={styles.noModifiersText}>No additional options available.</Text>
        ) : (
          (menuItemDetails.modifiers || []).map((modifier) => (
            <Card key={modifier.id} style={styles.card}>
              <Card.Title title={modifier.name} titleStyle={styles.modifierTitle} />
              <Card.Content>
                {(modifier.modifier_options || []).map((option) => (
                  <View key={option.id} style={styles.optionContainer}>
                    <Paragraph>
                      {option.name}
                      (+${option.additional_price ?? '0.00'})
                    </Paragraph>
                    {userRole !== 'guest' && (
                      <View style={styles.counterContainer}>
                        <Button icon="minus" compact onPress={() => handleQuantityChange(modifier.id, option.id, false)} />
                        <Text style={styles.countText}>
                          {modifierCounts[modifier.id]?.[option.id] || 0}
                        </Text>
                        <Button icon="plus" compact onPress={() => handleQuantityChange(modifier.id, option.id, true)} />
                      </View>
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
      {userRole === 'guest' ? (
        <Button disabled>We’re just browsing as guest</Button>
      ) : (
        <Button
          style={styles.addToCart}
          onPress={handleAddToCart}
          textColor='white'
          icon='cart'
        >
          Add to Cart
        </Button>
      )}
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  modifierTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // margin: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    marginLeft: 16,
  },
  card: {
    margin: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    marginHorizontal: 8,
  },
  noModifiersText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: 'grey',
  },
  addToCart: {
    backgroundColor: 'orange',
    fontSize: 39,
    margin: 16,
  }
});

export default MenuItemDetailScreen;
