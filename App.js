// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screen components
import SplashScreen from './screens/splashscreen';
import LoginScreen from './screens/loginscreen';
import HomeScreen from './screens/homescreen';
import OrdersScreen from './screens/ordersscreen';
// import MenuScreen from './screens/menuscreen';
import MenuStackNavigator from './screens/MenuStackNavigator';
import SettingsScreen from './screens/settingsscreen';
import RestaurantScreen from './screens/RestaurantScreen';
import MetricScreen from './screens/MetricScreen';
import MenuItemDetailScreen from './screens/MenuItemDetailScreen';


// Theme colors and styles
const themeColors = {
  // Updated color scheme
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

const roleToScreens = {
  customer: ['Home', 'Browse', 'Order', 'Account'],
  partner: ['Home', 'Order', 'Metrics', 'Account'],
  admin: ['Home', 'Restaurants', 'Metrics', 'Account'],
};

function getScreensForRole(role) {
  return roleToScreens[role] || [];
}

// Bottom tab navigator
const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ role }) => {
  const screensForRole = getScreensForRole(role);

  // Define screen to component mapping
  const screenComponents = {
    Home: HomeScreen,
    Browse: MenuStackNavigator,
    Order: OrdersScreen,
    Account: SettingsScreen,
    Metrics: MetricScreen,
    Restaurants: RestaurantScreen,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Order':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Menu':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            case 'Metrics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Restaurants':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Browse':
              iconName = focused ? 'search' : 'search-outline'; // Example icon for Browse
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline'; // Example icon for Account
              break;
            default:
              iconName = 'alert-circle-outline'; // Default icon
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.activeTintColor,
        tabBarInactiveTintColor: themeColors.inactiveTintColor,
        tabBarStyle: styles.tabBar,
        height: 60,
      })}
    >
     {screensForRole.map(screenName => {
        const ScreenComponent = screenComponents[screenName];
        return (
          <Tab.Screen 
            key={screenName}
            name={screenName}
            component={ScreenComponent} 
          />
        );
      })}
    </Tab.Navigator>
  );
};

// Stack navigator to handle login flow
const Stack = createStackNavigator();

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

  if (!userRole) {
    return <SplashScreen />; // Show splash screen while loading
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={paperTheme}>
        <Stack.Navigator>
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => <MainTabNavigator role={userRole} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
