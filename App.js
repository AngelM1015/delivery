// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screen components
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import OrdersScreen from './screens/OrdersScreen';
import MenuStackNavigator from './screens/MenuStackNavigator';
import SettingsScreen from './screens/SettingScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import MetricScreen from './screens/MetricScreen';
import MenuItemDetailScreen from './screens/MenuItemDetailScreen';
import PartnerOrderScreen from './screens/PartnerOrderScreen';
import { CartProvider } from './components/CartContext';

// Theme colors and styles
const themeColors = {
  activeTintColor: '#e23744',
  inactiveTintColor: '#a8a8a8',
  backgroundColor: '#ffffff',
  textPrimary: '#000000',
  headerColor: '#f8f8f8',
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: themeColors.backgroundColor,
  },
  header: {
    backgroundColor: themeColors.headerColor,
  },
});

const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: themeColors.activeTintColor,
    accent: themeColors.inactiveTintColor,
    background: themeColors.backgroundColor,
    text: themeColors.textPrimary,
    surface: themeColors.headerColor,
  },
};

const getTabBarIcon = (role, route, focused) => {
  const iconMap = {
    customer: {
      Home: focused ? 'home' : 'home-outline',
      Browse: focused ? 'search' : 'search-outline',
      Order: focused ? 'list' : 'list-outline',
      Account: focused ? 'person' : 'person-outline',
    },
    partner: {
      Home: focused ? 'home' : 'home-outline',
      Order: focused ? 'list' : 'list-outline',
      Metrics: focused ? 'bar-chart' : 'bar-chart-outline',
      Account: focused ? 'person' : 'person-outline',
    },
    admin: {
      Home: focused ? 'home' : 'home-outline',
      Restaurants: focused ? 'restaurant' : 'restaurant-outline',
      Metrics: focused ? 'bar-chart' : 'bar-chart-outline',
      Account: focused ? 'person' : 'person-outline',
    },
  };
  return iconMap[role][route.name] || 'alert-circle-outline';
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabNavigator = ({ role }) => {
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
      <Tab.Screen name="Home" component={HomeScreen} />
      {role !== 'partner' && <Tab.Screen name="Browse" component={MenuStackNavigator} />}
      <Tab.Screen name="Order" component={role === 'partner' ? PartnerOrderScreen : OrdersScreen} />
      {role === 'partner' && <Tab.Screen name="Metrics" component={MetricScreen} />}
      <Tab.Screen name="Account" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();
  }, []);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={paperTheme}>
        <CartProvider>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            {userRole && (
              <Stack.Screen name="Main" options={{ headerShown: false }}>
                {props => <MainTabNavigator {...props} role={userRole} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </CartProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;