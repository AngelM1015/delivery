import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions, StatusBar, FlatList } from "react-native";
import { Searchbar, Card, Title, Paragraph, Divider, Text, Button, Chip, Badge, Avatar, Appbar, ActivityIndicator, Banner, FAB, IconButton, Menu, Portal, Dialog, Snackbar, Surface, Switch, ToggleButton, ProgressBar, RadioButton, Caption, Subheading, useTheme, List } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url } from "../constants/api";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const FavoriteFoodMenuItemScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const { addToCart } = useCart();
  const { userRole, userId } = useUser();
  
  // State management
  const [state, setState] = useState({
    menuItems: [], favoriteItems: [], searchQuery: "", isLoading: true, refreshing: false,
    error: null, sortOrder: "name", filterCategory: null, categories: [], menuVisible: false,
    snackbarVisible: false, snackbarMessage: "", dialogVisible: false, selectedItem: null,
    bannerVisible: false, viewMode: "grid", showFavoritesOnly: false, dialogOption: null
  });
  
  // Destructure state
  const { menuItems, favoriteItems, searchQuery, isLoading, refreshing, error, sortOrder, 
    filterCategory, categories, menuVisible, snackbarVisible, snackbarMessage, dialogVisible, 
    selectedItem, bannerVisible, viewMode, showFavoritesOnly, dialogOption } = state;
  
  // Helper to update state
  const updateState = newState => setState(prev => ({ ...prev, ...newState }));
  
  // Fetch menu items
  const fetchMenuItems = async () => {
    updateState({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("userToken");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch menu items
      const menuResponse = await axios.get(`${base_url}api/v1/restaurants/${restaurantId}/menu_items/`, { headers });
      const uniqueCategories = [...new Set(menuResponse.data.filter(item => item.category).map(item => item.category))];
      
      updateState({ menuItems: menuResponse.data, categories: uniqueCategories });
      
      // Fetch favorites if user is logged in
      if (userId) {
        try {
          const favResponse = await axios.get(`${base_url}api/v1/users/${userId}/favorites`, { headers });
          const restaurantFavs = favResponse.data.filter(item => item.restaurant_id === parseInt(restaurantId));
          updateState({ favoriteItems: restaurantFavs.map(fav => fav.menu_item) });
        } catch (err) { console.error("Error fetching favorites:", err); }
      } else {
        updateState({ favoriteItems: [] });
      }
      
      await AsyncStorage.setItem("selectedRestaurantId", restaurantId.toString());
      updateState({ bannerVisible: true });
      setTimeout(() => updateState({ bannerVisible: false }), 3000);
    } catch (err) {
      console.error("Error fetching data:", err);
      updateState({ error: "Failed to load items. Please try again." });
    } finally {
      updateState({ isLoading: false });
    }
  };
  
  useEffect(() => { fetchMenuItems(); }, [restaurantId, userId]);
  
  const onRefresh = useCallback(async () => {
    updateState({ refreshing: true });
    await fetchMenuItems();
    updateState({ refreshing: false });
  }, [restaurantId, userId]);
  
  // Check if item is favorite
  const isItemFavorite = useCallback(item => favoriteItems.some(fav => fav.id === item.id), [favoriteItems]);
  
  // Filter and sort items
  const getFilteredItems = useCallback(() => {
    let items = showFavoritesOnly ? favoriteItems : menuItems;
    
    // Apply search filter
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (filterCategory) {
      items = items.filter(item => item.category === filterCategory);
    }
    
    // Sort items
    switch (sortOrder) {
      case "name": return [...items].sort((a, b) => a.name.localeCompare(b.name));
      case "price-low": return [...items].sort((a, b) => (a.item_prices?.[0] || 0) - (b.item_prices?.[0] || 0));
      case "price-high": return [...items].sort((a, b) => (b.item_prices?.[0] || 0) - (a.item_prices?.[0] || 0));
      default: return items;
    }
  }, [menuItems, favoriteItems, searchQuery, filterCategory, sortOrder, showFavoritesOnly]);
  
  // Action handlers
  const handleSelectItem = item => navigation.navigate("MenuItemDetailScreen", { menuItemId: item.id, restaurantId });
  
  const handleAddToCart = item => {
    addToCart(item, restaurantId);
    updateState({ snackbarMessage: `${item.name} added to cart!`, snackbarVisible: true });
  };
  
  const toggleFavorite = async (item) => {
    if (!userId) {
      updateState({ snackbarMessage: "You need to be logged in to add favorites.", snackbarVisible: true });
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem("userToken");
      const headers = { Authorization: `Bearer ${token}` };
      const isCurrentlyFavorite = isItemFavorite(item);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const favItem = favoriteItems.find(fav => fav.id === item.id);
        if (favItem) {
          await axios.delete(`${base_url}api/v1/users/${userId}/favorites/${favItem.id}`, { headers });
          updateState({
            favoriteItems: favoriteItems.filter(fav => fav.id !== item.id),
            snackbarMessage: `${item.name} removed from favorites`
          });
        }
      } else {
        // Add to favorites
        await axios.post(`${base_url}api/v1/users/${userId}/favorites`, { menu_item_id: item.id }, { headers });
        updateState({
          favoriteItems: [...favoriteItems, item],
          snackbarMessage: `${item.name} added to favorites`
        });
      }
      
      updateState({ snackbarVisible: true });
    } catch (err) {
      console.error("Error updating favorites:", err);
      updateState({ snackbarMessage: "Failed to update favorites. Please try again.", snackbarVisible: true });
    }
  };
  
  const showItemOptions = item => updateState({ selectedItem: item, dialogVisible: true, dialogOption: null });
  
  const handleDialogConfirm = () => {
    updateState({ dialogVisible: false });
    if (!selectedItem || !dialogOption) return;
    
    switch (dialogOption) {
      case "view": handleSelectItem(selectedItem); break;
      case "cart": handleAddToCart(selectedItem); break;
      case "favorite": toggleFavorite(selectedItem); break;
      case "edit": navigation.navigate("EditMenuItem", { menuItemId: selectedItem.id, restaurantId }); break;
    }
    
    updateState({ selectedItem: null, dialogOption: null });
  };
  
  // Render item card
  const renderMenuItem = ({ item }) => {
    const price = item.item_prices?.[0] || "Not Available";
    const isFavorite = isItemFavorite(item);
    
    if (viewMode === "list") {
      return (
        <List.Item
          key={item.id}
          title={item.name}
          description={item.description}
          left={props => item.image_url ? 
            <Avatar.Image size={50} source={{ uri: item.image_url }} {...props} /> : 
            <Avatar.Icon size={50} icon="food" {...props} />
          }
          right={props => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.price}>${price}</Text>
              {userRole === "customer" && (
                <IconButton {...props} icon={isFavorite ? "heart" : "heart-outline"} 
                  color={isFavorite ? theme.colors.error : theme.colors.text}
                  onPress={() => toggleFavorite(item)}
                />
              )}
              <IconButton {...props} icon="dots-vertical" onPress={() => showItemOptions(item)} />
            </View>
          )}
          onPress={() => handleSelectItem(item)}
          style={styles.listItem}
        />
      );
    }
    
    return (
      <Surface style={styles.cardContainer} key={item.id}>
        <Card style={styles.card}>
          {isFavorite && <Badge style={styles.favoriteBadge}>Favorite</Badge>}
          
          {item.image_url ? (
            <Card.Cover source={{ uri: item.image_url }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.noImage]}>
              <MaterialCommunityIcons name="food" size={50} color="#ccc" />
            </View>
          )}
          
          <Card.Content>
            <View style={styles.titleContainer}>
              <Title style={styles.title} numberOfLines={1}>{item.name}</Title>
              {userRole === "customer" && (
                <IconButton icon={isFavorite ? "heart" : "heart-outline"}
                  color={isFavorite ? theme.colors.error : theme.colors.text}
                  size={20} onPress={() => toggleFavorite(item)}
                />
              )}
            </View>
            
            {item.category && (
              <Chip style={styles.categoryChip} textStyle={styles.chipText}
                onPress={() => updateState({ filterCategory: item.category })}>
                {item.category}
              </Chip>
            )}
            
            <Paragraph numberOfLines={2} style={styles.description}>
              {item.description || "No description available"}
            </Paragraph>
            
            <View style={styles.priceContainer}>
              <Caption>Price:</Caption>
              <Subheading style={styles.price}>${price}</Subheading>
            </View>
            
            <View style={styles.cardActions}>
              {userRole === "customer" && (
                <Button mode="contained" icon="cart-plus" onPress={() => handleAddToCart(item)}
                  style={styles.addButton} labelStyle={styles.buttonLabel} compact>
                  Add to Cart
                </Button>
              )}
              
              <Button mode="outlined" icon="information-outline" onPress={() => handleSelectItem(item)}
                style={styles.detailsButton} labelStyle={styles.buttonLabel} compact>
                Details
              </Button>
              
              {userRole === "restaurantOwner" && (
                <Button mode="contained" icon="pencil" 
                  onPress={() => navigation.navigate("EditMenuItem", { menuItemId: item.id, restaurantId })}
                  style={styles.editButton} labelStyle={styles.buttonLabel} compact>
                  Edit
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </Surface>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading menu items...</Text>
        <ProgressBar indeterminate style={{ width: width * 0.7 }} />
      </View>
    );
  }
  
  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button mode="contained" icon="refresh" onPress={fetchMenuItems} style={styles.retryButton}>Retry</Button>
      </View>
    );
  }
  
  const filteredItems = getFilteredItems();
  
  // Empty state component
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="food-off" size={50} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchQuery ? "No items match your search" : 
         filterCategory ? `No items in category: ${filterCategory}` : 
         showFavoritesOnly ? "No favorite items yet" : "No menu items available"}
      </Text>
      {(searchQuery || filterCategory || showFavoritesOnly) && (
        <Button mode="outlined" icon="filter-remove" 
          onPress={() => updateState({ searchQuery: "", filterCategory: null, showFavoritesOnly: false })}
          style={styles.clearFiltersButton}>
          Clear Filters
        </Button>
      )}
    </View>
  );
  
  return (
    <>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Menu Items" subtitle={`Restaurant ID: ${restaurantId}`} />
        <Appbar.Action icon="sort" onPress={() => updateState({ menuVisible: true })} />
        
        <Menu visible={menuVisible} onDismiss={() => updateState({ menuVisible: false })}
          anchor={<View />} style={styles.menu}>
          <Menu.Item title="Sort by Name" icon="sort-alphabetical-ascending"
            onPress={() => updateState({ sortOrder: "name", menuVisible: false })} />
          <Menu.Item title="Sort by Price (Low to High)" icon="sort-numeric-ascending"
            onPress={() => updateState({ sortOrder: "price-low", menuVisible: false })} />
          <Menu.Item title="Sort by Price (High to Low)" icon="sort-numeric-descending"
            onPress={() => updateState({ sortOrder: "price-high", menuVisible: false })} />
          <Divider />
          <Menu.Item title="Reset Filters" icon="filter-remove"
            onPress={() => updateState({ filterCategory: null, menuVisible: false })} />
        </Menu>
      </Appbar.Header>
      
      <Banner visible={bannerVisible} 
        actions={[{ label: 'Dismiss', onPress: () => updateState({ bannerVisible: false }) }]}
        icon={({size}) => <Avatar.Icon size={size} icon="food" />}>
        Menu items loaded successfully! Swipe down to refresh at any time.
      </Banner>
      
      <View style={styles.container}>
        <Searchbar placeholder="Search Menu Items" onChangeText={query => updateState({ searchQuery: query })}
          value={searchQuery} style={styles.searchbar} icon="magnify" clearIcon="close" />
        
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <Chip selected={!filterCategory} onPress={() => updateState({ filterCategory: null })}
              style={styles.filterChip} mode="outlined">All</Chip>
            {categories.map(category => (
              <Chip key={category} selected={filterCategory === category}
                onPress={() => updateState({ filterCategory: category })}
                style={styles.filterChip} mode="outlined">{category}</Chip>
            ))}
          </ScrollView>
          
          <View style={styles.viewToggle}>
            <ToggleButton.Row onValueChange={value => value && updateState({ viewMode: value })} value={viewMode}>
              <ToggleButton icon="view-grid" value="grid" />
              <ToggleButton icon="view-list" value="list" />
            </ToggleButton.Row>
          </View>
        </View>
        
        <View style={styles.favoritesToggle}>
          <Text>Show Favorites Only</Text>
          <Switch value={showFavoritesOnly} 
            onValueChange={value => updateState({ showFavoritesOnly: value })}
            color={theme.colors.primary} />
        </View>
        
        {filteredItems.length === 0 ? (
          <EmptyListComponent />
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id.toString()}
            numColumns={viewMode === "grid" ? 2 : 1}
            key={viewMode} // Force re-render when view mode changes
            contentContainerStyle={viewMode === "grid" ? styles.gridContainer : null}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>
      
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => updateState({ dialogVisible: false })}>
          <Dialog.Title>Item Options</Dialog.Title>
          <Dialog.Content>
            {selectedItem && (
              <>
                <Paragraph>What would you like to do with {selectedItem.name}?</Paragraph>
                <RadioButton.Group onValueChange={value => updateState({ dialogOption: value })} value={dialogOption}>
                  <View style={styles.radioOption}>
                    <RadioButton value="view" /><Text>View Details</Text>
                  </View>
                  {userRole === "customer" && (
                    <>
                      <View style={styles.radioOption}>
                        <RadioButton value="cart" /><Text>Add to Cart</Text>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton value="favorite" />
                        <Text>{isItemFavorite(selectedItem) ? "Remove from Favorites" : "Add to Favorites"}</Text>
                      </View>
                    </>
                  )}
                  {userRole === "restaurantOwner" && (
                    <View style={styles.radioOption}>
                      <RadioButton value="edit" /><Text>Edit Item</Text>
                    </View>
                  )}
                </RadioButton.Group>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => updateState({ dialogVisible: false })}>Cancel</Button>
            <Button onPress={handleDialogConfirm} disabled={!dialogOption}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <FAB style={styles.fab} icon="refresh" onPress={onRefresh} label="Refresh" small />
      
      <Snackbar visible={snackbarVisible} onDismiss={() => updateState({ snackbarVisible: false })}
        action={{ label: 'Dismiss', onPress: () => updateState({ snackbarVisible: false }) }}
        duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff", padding: 20 },
  loadingText: { marginTop: 15, fontSize: 16, color: '#555', marginBottom: 20 },
  progressBar: { width: width * 0.7, height: 5 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff", padding: 20 },
  errorText: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
  retryButton: { marginTop: 10 },
  searchbar: { margin: 8, borderRadius: 8, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.5 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 8 },
  chipScroll: { flexGrow: 1, marginRight: 8 },
  filterChip: { marginRight: 8, marginBottom: 4 },
  chipText: { fontSize: 12 },
  viewToggle: { flexDirection: 'row', alignItems: 'center' },
  favoritesToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginHorizontal: 8, marginBottom: 8 },
  contentContainer: { flex: 1 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', paddingHorizontal: 8, paddingBottom: 80 },
  cardContainer: { width: width / 2 - 16, marginVertical: 12, marginHorizontal: 4, borderRadius: 14, elevation: 5, backgroundColor: "#fff", overflow: 'hidden' },
  card: { borderRadius: 14, overflow: 'hidden', paddingBottom: 12 },
  cardImage: { height: 130, resizeMode: 'cover' },
  titleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  description: { marginTop: 10, fontSize: 14, lineHeight: 20 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  addButton: { flex: 1, marginRight: 5, height: 38, justifyContent: 'center', backgroundColor: '#F09B00', borderRadius: 6 },
  detailsButton: { flex: 1, marginLeft: 5, height: 38, justifyContent: 'center', borderRadius: 6 },
  editButton: { flex: 1, marginLeft: 6, height: 38, justifyContent: 'center', backgroundColor: '#4a90e2', borderRadius: 6 },
  buttonLabel: { fontSize: 13, fontWeight: '600' },
  listItem: { marginVertical: 2, marginHorizontal: 8, borderRadius: 8, backgroundColor: '#fff' },
  menu: { marginTop: 40, marginRight: 8 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#F09B00' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 15, fontSize: 16, color: '#777', textAlign: 'center' },
  clearFiltersButton: { marginTop: 20 },
  favoriteBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF4081', zIndex: 1 },
  title: { flexShrink: 1 },
  noImage: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  price: { fontWeight: 'bold', fontSize: 16 },
  categoryChip: { marginTop: 8, marginRight: 8 }
});

export default FavoriteFoodMenuItemScreen;
