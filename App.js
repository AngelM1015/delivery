import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, AppState } from 'react-native';
import { DefaultTheme, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';

import SplashScreen from './screens/splashscreen';
import LoginScreen from './screens/loginscreen';
import OnboardingComponent from './components/OnboardingComponent';
import RestaurantMenuScreen from './screens/RestaurantMenuScreen';
import MenuItemDetailScreen from './screens/MenuItemDetailScreen';
import MainTabNavigator from './routes/MainTabNavigator';
import SettingScreen from './screens/SettingScreen';

const themeColors = {
  activeTintColor: '#e23744',
  inactiveTintColor: '#a8a8a8',
  backgroundColor: '#ffffff',
  textPrimary: '#000000',
  headerColor: '#f8f8f8',
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.backgroundColor,
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

const Stack = createStackNavigator();

function App() {
  const [userRole, setUserRole] = useState('guest');
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchUserData_CheckActiveOrder = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        if (role) {
          setUserRole(role);
        }

        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(onboarded === 'true');

        const token = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!token);
        
        // Check for active orders here
        // const activeOrders = await checkActiveOrders();
        // if (activeOrders) {
        //   handleActiveOrders(activeOrders);
        // }

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setTimeout(() => {
          setIsReady(true);
        }, 2000);
      }
    };

    fetchUserData_CheckActiveOrder();

    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Recheck for active orders when app returns to the foreground
        fetchUserData_CheckActiveOrder();
      }
      appState.current = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.activeTintColor} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={paperTheme}>
        <UserProvider>
          <CartProvider>
            <Stack.Navigator initialRouteName={isAuthenticated ? "Main" : (hasOnboarded ? "Login" : "Onboarding")}>
              <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Onboarding" component={OnboardingComponent} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Main" options={{ headerShown: false }}>
                {props => <MainTabNavigator {...props} role={userRole} />}
              </Stack.Screen>
              <Stack.Screen name="SettingScreen" component={SettingScreen} />
              <Stack.Screen name="RestaurantMenuScreen" component={RestaurantMenuScreen} />
              <Stack.Screen name="MenuItemDetailScreen" component={MenuItemDetailScreen} />
            </Stack.Navigator>
          </CartProvider>
        </UserProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;