import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
} from "react-native";
import { Card, Text, Searchbar } from "react-native-paper";
import { base_url } from "../constants/api";
import { COLORS } from "../constants/colors";
import { Icons } from "../constants/Icons";
import useOrders from "../hooks/useOrders";
import useRestaurants from "../hooks/useRestaurants";

const MenuOfRestaurantsScreen = ({ navigation }) => {
  const { orders } = useOrders();
  const {
    restaurants,
    menuItems,
    selectedRestaurant,
    setSelectedRestaurant,
    fetchRestaurants,
  } = useRestaurants();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  // Use useEffect to update filteredOrders when orders or selectedRestaurant changes
  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  // Use useEffect to update filteredOrders when selectedRestaurant changes
  useEffect(() => {
    if (selectedRestaurant) {
      console.log("Selected restaurant changed, updating filtered orders");
    }
  }, [selectedRestaurant]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log("query", query);

    const filtered = orders.filter(
      (order) =>
        order.order_items.some(
          (item) => item.menu_item && item.menu_item.includes(query),
        ) || order.status.toLowerCase().includes(query.toLowerCase()),
    );
    console.log("filtered orders", filtered.length);
    setFilteredOrders(filtered);
    console.log("rendering filtered orders", filteredOrders.length);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (query && !recentSearches.includes(query)) {
        setRecentSearches([query, ...recentSearches].slice(0, 5));
      }
    }, 1000);
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleDeleteSearch = (query) => {
    setRecentSearches(recentSearches.filter((search) => search !== query));
  };

  const handleDeleteAllSearches = () => {
    setRecentSearches([]);
  };

  const renderRestaurant = ({ item: restaurant }) => {
    // Removed the setFilteredOrders call from here to fix the warning
    const isSelected = selectedRestaurant === restaurant.id;
    const image_url = restaurant.image_url
      ? base_url + restaurant.image_url
      : "https://via.placeholder.com/150";
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

  const renderOrderItem = ({ item }) => {
    let statusText = "";
    let statusColor = "";

    switch (item.status) {
      case "delivered":
        statusText = "Completed";
        statusColor = "black";
        break;
      case "canceled":
        statusText = "Canceled";
        statusColor = "red";
        break;
      default:
        statusText = "In Progress";
        statusColor = "green";
        break;
    }

    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() =>
          statusText == "In Progress"
            ? navigation.navigate("OngoingOrder", { id: item.id })
            : navigation.navigate("OrderDetails", { orderId: item.id })
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              source={{
                uri: item.image_url
                  ? base_url + item.image_url
                  : "../assets/images/icon.png",
              }}
              style={{ width: 80, height: 80 }}
            />
            <View style={{ marginLeft: 15, gap: 6 }}>
              <Text
                style={{ color: COLORS.black, fontSize: 20, maxWidth: "90%" }}
              >
                {item.order_items
                  .map((orderItem) => orderItem.menu_item)
                  .join(", ")}
              </Text>
              <Text style={{ color: "grey", fontSize: 14 }}>
                {item.restaurant_name}
              </Text>
              <Text style={{ color: "#F09B00", fontSize: 14 }}>
                ${item.total_price}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => {
    const price =
      item.item_prices?.length > 0 ? item.item_prices[0] : "Not Available";
    const imageUrl = item.image_url
      ? base_url + item.image_url
      : "https://via.placeholder.com/150";
    const rating = "4.9";

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

  const renderRecentSearch = ({ item }) => (
    <View style={styles.recentSearchItem}>
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <Icons.RecenetSearch />
        <TouchableOpacity
          onPress={() => handleRecentSearch(item)}
          style={{ flex: 1 }}
        >
          <Text style={styles.recentSearchText}>{item}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => handleDeleteSearch(item)}>
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 10, flex: 1 }}>
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
        <Text style={styles.recentText}>My recent orders</Text>
        <FlatList
          data={filteredOrders.filter(
            (order) => order.restaurant_id == selectedRestaurant,
          )}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text>No orders available</Text>}
          refreshing={loading}
          style={styles.orderHorizontalList}
        />

        <Text style={{ marginStart: 10, fontWeight: "bold" }}>MENU</Text>
        <FlatList
          data={menuItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={<Text>No menu items available</Text>}
        />

        {/* {recentSearches.length > 0 && (
          <View style={styles.recentSearchContainer}>
            <View style={styles.recentSearchHeader}>
              <Text style={styles.recentSearchTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={handleDeleteAllSearches}>
                <Text style={styles.deleteAllText}>Delete</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.recentSearchList}
            />
          </View>
        )} */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  horizontalList: {
    minHeight: 180,
    maxHeight: 180,
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
    marginVertical: 10,
    marginHorizontal: 2,
    padding: 6,
    borderRadius: 10,
    borderWidth: 0.1,
    shadowOpacity: 0,
    backgroundColor: "#fff",
    elevation: 3,
    width: "180",
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
  orderHorizontalList: {
    minHeight: 110,
    maxHeight: 110,
    marginBottom: 14,
  },
  orderItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginEnd: 8,
    height: "100%",
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  recentSearchContainer: {
    marginBottom: 20,
    marginTop: 30,
  },
  recentSearchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recentSearchTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
  },
  deleteAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  recentSearchList: {
    marginBottom: 10,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  recentSearchText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: 600,
    flex: 1,
    marginLeft: 5,
  },
  deleteText: {
    color: COLORS.delete,
    fontSize: 16,
    fontWeight: "700",
  },
  recentText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
});

export default MenuOfRestaurantsScreen;
