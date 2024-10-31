import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/homescreen';
import MenuOfRestaurantsScreen from '../screens/MenuOfRestaurantsScreen';
import MenuStackNavigator from '../screens/MenuStackNavigator';
import PartnerOrderScreen from '../screens/PartnerOrderScreen';
import MetricScreen from '../screens/MetricScreen';
import AdminScreen from '../screens/AdminScreen';
import SettingsScreen from '../screens/SettingScreen';
import ChatScreen from '../screens/ChatScreen';
import CartScreen from '../screens/CartScreen';
import MenuCheckoutScreen from '../screens/MenuCheckoutScreen';
import OngoingOrderScreen from '../screens/OngoingOrderScreen';
import { StyleSheet, View } from 'react-native';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import { Badge } from 'react-native-paper';
import { useCart } from '../context/CartContext';

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
    paddingBottom: 0
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    top: -10,
    left: -30,
    backgroundColor: 'orange'
  }
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for order-related screens
const OrderStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartScreen" component={CartScreen} />
    <Stack.Screen name="MenuCheckoutScreen" component={MenuCheckoutScreen} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
    <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen}/>
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
      Home: focused ? 'home' : 'home-outline',
      Browse: focused ? 'search' : 'search-outline',
      Order: focused ? 'list' : 'list-outline',
      Account: focused ? 'person' : 'person-outline',
    },
    customer: {
      Home: focused ? 'home' : 'home-outline',
      Browse: focused ? 'search' : 'search-outline',
      Cart: focused ? "cart" : "cart-outline",
      Account: focused ? 'person' : 'person-outline',
    },
    partner: {
      Dashboard: focused ? 'grid' : 'grid-outline',
      Order: focused ? 'list' : 'list-outline',
      Metrics: focused ? 'bar-chart' : 'bar-chart-outline',
      Account: focused ? 'person' : 'person-outline',
    },
    restaurant_owner: {
      Dashboard: focused ? 'grid' : 'grid-outline',
      Metrics: focused ? 'bar-chart' : 'bar-chart-outline',
      Admin: focused ? 'people' : 'people-outline',
      Account: focused ? 'person' : 'person-outline',
    },
    admin: {
      Dashboard: focused ? 'grid' : 'grid-outline',
      Metrics: focused ? 'bar-chart' : 'bar-chart-outline',
      Admin: focused ? 'storefront' : 'storefront-outline',
      Account: focused ? 'person' : 'person-outline',
    },
  };
  return iconMap[role][route.name] || 'alert-circle-outline';
};

const MainTabNavigator = ({ role = 'guest' }) => {
  const { cartItems } = useCart();

  return (
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
                {iconName === 'cart' || iconName === 'cart-outline' && (
                  <View style={{  bottom: 20, right: 20, margin: 0 }}>
                    {cartItems.length > 0 && (
                      <Badge size={16} style={styles.cartBadge}>
                        {cartItems.length}
                      </Badge>
                    )}
                  </View>
                )}
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
      {['partner', 'restaurant_owner', 'admin'].includes(role) ? (
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        <Tab.Screen name="Home" component={HomeScreen} />
      )}
      {['guest'].includes(role) && (
        <Tab.Screen name="Browse" component={MenuOfRestaurantsScreen} />
      )}
      {['customer'].includes(role) && (
        <Tab.Screen name="Browse" component={MenuStackNavigator} />
      )}
      {['customer', 'partner'].includes(role) && (
        <Tab.Screen
          name="Cart"
          component={role === 'partner' ? PartnerOrderStackNavigator : OrderStackNavigator} // Use stack navigator for orders
        />
      )}
      {['partner', 'admin', 'restaurant_owner'].includes(role) && (
        <Tab.Screen name="Metrics" component={MetricScreen} />
      )}
      {['admin', 'restaurant_owner'].includes(role) && (
        <Tab.Screen name="Admin" component={AdminScreen} />
      )}
      <Tab.Screen name="Account" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
