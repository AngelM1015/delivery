import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ScrollView, View, Image, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, Provider as PaperProvider, Button } from 'react-native-paper';

const MenuItemImage = ({ menuItemDetails, index }) => {
  // Construct a random Unsplash image URL with a search term based on the menu item's name
  // The 'sig' parameter is used to change the image on every render if needed
  const imageUrl = `https://source.unsplash.com/random/300x300?${encodeURIComponent(menuItemDetails.name)}&sig=${index}`;

  return (
    <Image source={{ uri: imageUrl }} style={styles.image} />
  );
};

const MenuItemDetailScreen = ({ route }) => {
  const { menuItem: { restaurant_id: restaurantId, id: menuItemId } } = route.params;
  const [menuItemDetails, setMenuItemDetails] = useState(null);
  const [modifierCounts, setModifierCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const url = `http://localhost:3000/api/v1/restaurants/${restaurantId}/menu_items/${menuItemId}`;
        const response = await axios.get(url);

        console.log("API Response Data:", response.data);

        setMenuItemDetails(response.data);
        const initialCounts = response.data.modifiers.reduce((counts, modifier) => {
          counts[modifier.id] = {};
          modifier.modifier_options.forEach(option => {
            counts[modifier.id][option.id] = 0;
          });
          return counts;
        }, {});
        setModifierCounts(initialCounts);
      } catch (err) {
        setError('Failed to load menu item. Please try again later.');
      } finally {
        setIsLoading(false);
      }
      console.log("Modifier Options:", modifier.modifier_options);
    };

    fetchMenuItem();
  }, [restaurantId, menuItemId]);

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
      <MenuItemImage menuItemDetails={menuItemDetails} index={0} style={styles.image} />
        <Title style={styles.title}>{menuItemDetails.name}</Title>
        <Paragraph style={styles.description}>{menuItemDetails.description}</Paragraph>
        {menuItemDetails.modifiers.length === 0 ? (
          <Text style={styles.noModifiersText}>No additional options available.</Text>
        ) : (
          menuItemDetails.modifiers.map((modifier) => (
            <Card key={modifier.id} style={styles.card}>
              <Card.Title title={modifier.name} />
              <Card.Content>
                {modifier.modifier_options.map((option) => (
                  <View key={option.id} style={styles.optionContainer}>
                    <Paragraph>
                      {option.name} 
                      (+${option.additional_price?? '0.00'})
                    </Paragraph>
                    <View style={styles.counterContainer}>
                      <Button icon="minus" compact onPress={() => handleQuantityChange(modifier.id, option.id, false)} />
                      <Text style={styles.countText}>
                        {modifierCounts[modifier.id]?.[option.id] || 0}
                      </Text>
                      <Button icon="plus" compact onPress={() => handleQuantityChange(modifier.id, option.id, true)} />
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
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
});

export default MenuItemDetailScreen;
