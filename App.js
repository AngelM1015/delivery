// React and React Native imports
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';

// Third-party library imports
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context providers
import { CartProvider } from './components/CartContext';
import { UserProvider } from './context/UserContext';


// Screen component imports
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import OrdersScreen from './screens/OrdersScreen';
import MenuStackNavigator from './screens/MenuStackNavigator';
import SettingsScreen from './screens/SettingScreen';
import RestaurantScreen from './screens/RestaurantScreen';
import MetricScreen from './screens/MetricScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import MenuItemDetailScreen from './screens/MenuItemDetailScreen';
import PartnerOrderScreen from './screens/PartnerOrderScreen';
import AdminScreen from './screens/AdminScreen';

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
      LiveOrders: focused ? 'cloud-upload' : 'cloud-upload-outline',
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabNavigator = ({ role }) => {
  if (!role) {
    return null; // Handle case where role is not defined
  }

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
      {(role !== 'partner' && role !== 'admin' && role !== 'restaurant_owner') && (
        <Tab.Screen name="Browse" component={MenuStackNavigator} />
      )}
      {(role !== 'admin' && role !== 'restaurant_owner') && (
        <Tab.Screen name="Order" component={role === 'partner' ? PartnerOrderScreen : OrdersScreen} />
      )}
      {(role === 'partner' || role === 'admin' || role === 'restaurant_owner') && (
        <Tab.Screen name="Metrics" component={MetricScreen} />
      )}
      {(role === 'admin' || role === 'restaurant_owner') && (
        <Tab.Screen name="Admin" component={AdminScreen} />
      )}
      <Tab.Screen name="Account" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setTimeout(() => {
          setIsReady(true);
        }, 0); //Add a delay or sub-UI loading.. maybe a type of auth flow or initial first load requesting location services, among other things.
      } 
    }

    fetchUserRole();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={paperTheme}>
      <UserProvider>
        <CartProvider>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {props => <MainTabNavigator {...props} role={userRole} />}
            </Stack.Screen>
            <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
          </Stack.Navigator>
        </CartProvider>
        </UserProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;