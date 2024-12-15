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
import * as Location from "expo-location";
import { Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PartnerOrders from "../components/PartnerOrders";
import useRestaurants from "../hooks/useRestaurants";
import { base_url } from "../constants/api";
import client from "../client";
import cable from "../cable";
import Toast from "react-native-toast-message";

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

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(
    "https://via.placeholder.com/150"
  );
  const [newOrders, setNewOrders] = useState([]);

  const sendLocationToBackend = async (subscription) => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync();
      console.log("location fetched: ", currentLocation.coords);
  
      if (subscription && typeof subscription.sendLocation === "function") {
        subscription.sendLocation({ location: currentLocation.coords });
        console.log("location sent: ", currentLocation.coords);
      } else {
        console.error("subscription.sendLocation is not a function or subscription is undefined");
      }
    } catch (error) {
      console.error("Error sending location to backend:", error);
    }
  };

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

      const userId = await AsyncStorage.getItem("userId");
      if (role === "partner") {
        const currentLocation = await Location.getCurrentPositionAsync();
        console.log("current location", currentLocation.coords);

        if (cable.connection.isOpen()) {
          console.log("WebSocket connection is open.");
        } else {
          console.log("WebSocket connection is not open.");
        }
        console.log("user id", userId);

        const subscription = await cable.subscriptions.create(
          { channel: "PartnerChannel", id: userId },
          {
            received(data) {
              console.log("New order notification:", data);
              if (data.new_order) {
                console.log('in new orderr assignement!')
                addNewOrder(data.new_order);
                // Toast.show({
                //   type: "success",
                //   text1: "New Order Assigned!",
                //   text2: `Order from ${data.new_order.restaurant_name}`,
                //   position: "top",
                // });
              }
              else {
                console.log('in new orderr request!')
                // Toast.show({
                //   type: "success",
                //   text1: "New Order Request",
                //   text2: `Order from ${data.new_order.restaurant_name}`,
                //   position: "top",
                // });
              }
            },

            sendLocation(locationData) {
              this.perform("send_location", { location: locationData });
            },
          }
        );
        console.log("subscription", subscription);

        const intervalId = setInterval(
          () => sendLocationToBackend(subscription),
          10000
        );

        return () => {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error("Error during WebSocket cleanup:", error);
          } finally {
            clearInterval(intervalId);
          }
        };
      }
    };

    const fetchData = async (role) => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        let endpoint = role === "partner" ? "orders/partner_orders" : null;
        if (endpoint) {
          const response = await axios.get(`${base_url}api/v1/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (role === "partner") {
            setOrders(response.data);
            groupOrders(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    console.log('subscriptions: ', cable.subscriptions);

    fetchRoleAndData();
  }, []);

  const groupOrders = (partnerOrders) => {
    const groupedOrders = partnerOrders.reduce((x, y) => {
      (x[y.status] = x[y.status] || []).push(y);
      return x;
    }, {});

    setCompletedOrders(groupedOrders.delivered?.length || 0);
    setCanceledOrders(groupedOrders.canceled?.length || 0);
  };

  const addNewOrder = (newOrder) => {
    setNewOrders((prevOrders) => [...prevOrders, newOrder]);
    setTimeout(() => {
      setNewOrders((prevOrders) => prevOrders.filter((order) => order.id !== newOrder.id));
    }, 10000);
  };

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

  const toggleSwitch = async ( item ) => {
    item.isenabled = !item.isenabled;

    setMenuItems((prevItems) =>
      prevItems.map((menu) =>
        menu.id === item.id ? { ...menu, isenabled: item.isenabled } : menu
      )
    );
    try {
      const token = await AsyncStorage.getItem("userToken");
      const endpoint = `restaurants/${selectedRestaurant}/menu_items/${item.id}/enable_menu_item`

      const response = await client.patch(`api/v1/${endpoint}`,{menu_item: item}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('new value of enabled', item.isenabled)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const renderDashboard = () => {
    // if (loading) {
    //   return <Text>Loading...</Text>;
    // }

    if (role === "partner") {
      return (
        <>
          <ScrollView style={styles.newOrdersContainer}>
            {newOrders.map((order) => (
              <View key={order.id} style={styles.newOrderCard}>
                <Text style={styles.newOrderText}> {`Order Id:  ${order.id}`}</Text>
                <Text style={styles.newOrderText}>{`Order from ${order.restaurant_name}`}</Text>
                <Text style={styles.newOrderText}> {`Order Items:  ${order.order_items} items`}</Text>
                <Text style={styles.newOrderText}> {`Order Price:  $${order.price}`}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <View style={styles.orderGroups}>
              <Text style={styles.canceledOrders}> {canceledOrders} Cancel</Text>
              <Text style={styles.completedOrders}>
                {completedOrders} Completed
              </Text>
            </View>
            <TouchableOpacity
              style={styles.orderHistoryButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.orderHistoryButtonText}>Order History</Text>
            </TouchableOpacity>
            <PartnerOrders
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              orders={orders}
            />
          </View>
        </>
      );
    } else if (role === "restaurant_owner") {
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
    } else if (role === "admin") {
      return <Text>Hi Admin</Text>;
    } else {
      return <Text>Role-specific data not available.</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      {renderDashboard()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  newOrdersContainer: {
    flex: 1,
    padding: 10,
  },
  newOrderCard: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { height: 4 },
    shadowOpacity: 0.15,
    padding: 10,
  },
  newOrderText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 20,
    color: "#F09B00",
  },
  footer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#DDD",
  },
  orderGroups: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  canceledOrders: {
    color: "red",
    fontSize: 20,
  },
  completedOrders: {
    color: "green",
    fontSize: 20,
  },
  orderHistoryButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  orderHistoryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    marginStart: 10
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
    borderRadius: 10
  },
  menuDetails: {
    padding: 2,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  switchContainer: {

  },
  switch: {
    top: -110,
    left: 8
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#F09B00",
  },
});

export default DashboardScreen;
