import React, { useContext, useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import PartnerDashboardScreen from "../screens/PartnerDashboardScreen";
import RestaurantDashboardScreen from "../screens/RestaurantDashboardScreen";
import HomeScreen from "../screens/homescreen";
import MenuOfRestaurantsScreen from "../screens/MenuOfRestaurantsScreen";
import MenuStackNavigator from "../screens/MenuStackNavigator";
import PartnerOrderScreen from "../screens/PartnerOrderScreen";
import MetricScreen from "../screens/MetricScreen";
import AdminScreen from "../screens/AdminScreen";
import SettingsScreen from "../screens/SettingScreen";
import ChatScreen from "../screens/ChatScreen";
import CartScreen from "../screens/CartScreen";
import MenuCheckoutScreen from "../screens/MenuCheckoutScreen";
import OngoingOrderScreen from "../screens/OngoingOrderScreen";
import FavoriteFoodMenuItemScreen from "../screens/FavoriteFoodMenuItemScreen";
import { StyleSheet, View, Text } from "react-native";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import { Badge } from "react-native-paper";
import { useCart } from "../context/CartContext";
import OngoingOrderDrawer from "../components/OngoingOrderDrawer";
import NewOrderScreen from "../screens/NewOrderScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";

const themeColors = {
  activeTintColor: "#F09B00",
  inactiveTintColor: "#B0C4DE",
  backgroundColor: "#F2F2F5",
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: themeColors.backgroundColor,
    borderRadius: 40,
    marginBottom: 24,
    marginHorizontal: 15,
    height: 56,
    paddingBottom: 0,
    zIndex: 10,
  },
  icon: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    top: -10,
    left: -30,
    backgroundColor: "orange",
  },
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for order-related screens
const OrderStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartScreen" component={CartScreen} />
    <Stack.Screen name="MenuCheckoutScreen" component={MenuCheckoutScreen} />
  </Stack.Navigator>
);

const PartnerOrderStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PartnerOrderScreen" component={PartnerOrderScreen} />
    <Stack.Screen name="OngoingOrderScreen" component={OngoingOrderScreen} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
  </Stack.Navigator>
);

const getTabBarIcon = (role, route, focused) => {
  const iconMap = {
    guest: {
      Home: focused ? "home" : "home-outline",
      Browse: focused ? "search" : "search-outline",
      Order: focused ? "list" : "list-outline",
      Account: focused ? "person" : "person-outline",
    },
    customer: {
      Home: focused ? "home" : "home-outline",
      Browse: focused ? "search" : "search-outline",
      Cart: focused ? "cart" : "cart-outline",
      Account: focused ? "person" : "person-outline",
    },
    partner: {
      PartnerDashboard: focused ? "grid" : "grid-outline",
      Order: focused ? "list" : "list-outline",
      Metrics: focused ? "bar-chart" : "bar-chart-outline",
      Account: focused ? "person" : "person-outline",
    },
    restaurant_owner: {
      RestaurantDashboard: focused ? "grid" : "grid-outline",
      Metrics: focused ? "bar-chart" : "bar-chart-outline",
      Admin: focused ? "people" : "people-outline",
      Account: focused ? "person" : "person-outline",
    },
    admin: {
      PartnerDashboard: focused ? "grid" : "grid-outline",
      Metrics: focused ? "bar-chart" : "bar-chart-outline",
      Admin: focused ? "storefront" : "storefront-outline",
      Account: focused ? "person" : "person-outline",
    },
  };
  return iconMap[role]?.[route.name] || "alert-circle-outline";
};

const MainTabNavigator = ({ route }) => {
  const { cartItems } = useCart();
  const { userRole } = useContext(UserContext);
  const [role, setRole] = useState(route?.params?.role || "guest");

  // Sync role with context and AsyncStorage
  useEffect(() => {
    const syncRole = async () => {
      try {
        // If userRole from context is available and different, use it
        if (userRole && userRole !== role) {
          console.log("Using role from context:", userRole);
          setRole(userRole);
          return;
        }

        // Otherwise try to get from AsyncStorage
        const storedRole = await AsyncStorage.getItem("userRole");
        if (storedRole && storedRole !== role) {
          console.log("Using role from AsyncStorage:", storedRole);
          setRole(storedRole);
        }
      } catch (error) {
        console.error("Error syncing role:", error);
      }
    };

    syncRole();
  }, [userRole]); // Only re-run when userRole changes

  return (
    <View style={{ flex: 1 }}>
      {/* {role === 'customer' && (
        <OngoingOrderDrawer style={{ bottomOffset: 80 }} />
      )} */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = getTabBarIcon(role, route, focused);
            return (
              <View
                style={[
                  styles.icon,
                  {
                    backgroundColor: focused
                      ? themeColors.activeTintColor
                      : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={size}
                  color={focused ? "#FFF" : color}
                >
                  {iconName === "cart" ||
                    (iconName === "cart-outline" && (
                      <View style={{ bottom: 20, right: 20, margin: 0 }}>
                        {cartItems.length > 0 && (
                          <Badge size={16} style={styles.cartBadge}>
                            {cartItems.length}
                          </Badge>
                        )}
                      </View>
                    ))}
                </Ionicons>
              </View>
            );
          },
          tabBarActiveTintColor: themeColors.activeTintColor,
          tabBarInactiveTintColor: themeColors.inactiveTintColor,
          tabBarStyle: styles.tabBar,
          headerShown: false,
          tabBarShowLabel: false,
        })}
      >
        {["partner", "admin"].includes(role) && (
          <Tab.Screen
            name="PartnerDashboard"
            component={PartnerDashboardScreen}
          />
        )}
        {["restaurant_owner"].includes(role) && (
          <Tab.Screen
            name="RestaurantDashboard"
            component={RestaurantDashboardScreen}
          />
        )}
        {["customer", "guest"].includes(role) && (
          <Tab.Screen name="Home" component={HomeScreen} />
        )}
        {["customer", "guest"].includes(role) && (
          <Tab.Screen name="Browse" component={MenuOfRestaurantsScreen} />
        )}
        {/* {["customer"].includes(role) && (
          <Tab.Screen name="Browse" component={MenuStackNavigator} />
        )} */}
        {["customer", "partner"].includes(role) && (
          <Tab.Screen
            name="Cart"
            component={
              role === "partner"
                ? PartnerOrderStackNavigator
                : OrderStackNavigator
            }
          />
        )}
        {["restaurant_owner"].includes(role) && (
          <Tab.Screen name="NewOrder" component={NewOrderScreen} />
        )}
        {["partner", "admin", "restaurant_owner"].includes(role) && (
          <Tab.Screen name="Metrics" component={MetricScreen} />
        )}
        {["admin"].includes(role) && (
          <Tab.Screen name="Admin" component={AdminScreen} />
        )}
        <Tab.Screen name="Account" component={SettingsScreen} />
      </Tab.Navigator>
    </View>
  );
};

export default MainTabNavigator;
