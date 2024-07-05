import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import MenuOfRestaurantsScreen from '../screens/MenuOfRestaurantsScreen';
import MenuStackNavigator from '../screens/MenuStackNavigator';
import OrdersScreen from '../screens/OrdersScreen';
import PartnerOrderScreen from '../screens/PartnerOrderScreen';
import MetricScreen from '../screens/MetricScreen';
import AdminScreen from '../screens/AdminScreen';
import SettingsScreen from '../screens/SettingScreen';
import { StyleSheet } from 'react-native';

const themeColors = {
  activeTintColor: '#e23744',
  inactiveTintColor: '#a8a8a8',
  backgroundColor: '#ffffff',
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: themeColors.backgroundColor,
  },
});

const Tab = createBottomTabNavigator();

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
      Order: focused ? 'list' : 'list-outline',
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = getTabBarIcon(role, route, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.activeTintColor,
        tabBarInactiveTintColor: themeColors.inactiveTintColor,
        tabBarStyle: styles.tabBar,
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
        <Tab.Screen name="Order" component={role === 'partner' ? PartnerOrderScreen : OrdersScreen} />
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
