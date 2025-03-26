import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  AppState,
  Alert,
} from "react-native";
import {
  DefaultTheme,
  Provider as PaperProvider,
  ActivityIndicator,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import OngoingOrderDrawer from "./components/OngoingOrderDrawer";
import SplashScreen from "./screens/splashscreen";
import LoginScreen from "./screens/loginscreen";
import SignupScreen from "./screens/SignupScreen";
// import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
// import EmailVerificationScreen from './screens/EmailVerificationScreen';
import OnboardingComponent from "./components/OnboardingComponent";
import RestaurantMenuScreen from "./screens/RestaurantMenuScreen";
import MenuItemDetailScreen from "./screens/MenuItemDetailScreen";
import MenuAboutScreen from "./screens/MenuAboutScreen";
import MainTabNavigator from "./routes/MainTabNavigator";
import SettingScreen from "./screens/SettingScreen";
import PersonalData from "./screens/PersonalData";
import SettingEdit from "./screens/SettingsEdit";
import MenuCheckoutScreen from "./screens/MenuCheckoutScreen";
import Toast from "react-native-toast-message";
import { StripeProvider } from "@stripe/stripe-react-native";
import AddPaymentMethodScreen from "./screens/AddPaymentMethodScreen";
import OrdersScreen from "./screens/ordersscreen";
import OrderDetailScreen from "./screens/OrderDetailScreen";
import OngoingOrderScreen from "./screens/OngoingOrderScreen";
import { LogBox } from "react-native";
import ChatScreen from "./screens/ChatScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NetInfo from '@react-native-community/netinfo';

const themeColors = {
  activeTintColor: "#e23744",
  inactiveTintColor: "#a8a8a8",
  backgroundColor: "#ffffff",
  textPrimary: "#000000",
  headerColor: "#f8f8f8",
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  const [userRole, setUserRole] = useState("guest");
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const appState = useRef(AppState.currentState);
  const [isRoleChanged, setIsRoleChanged] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  LogBox.ignoreAllLogs(true);

  useEffect(() => {
    const fetchUserData_CheckActiveOrder = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        console.log("role", role);
        if (role) {
          setUserRole(role);
        }

        const onboarded = await AsyncStorage.getItem("hasOnboarded");
        setHasOnboarded(onboarded === "true");

        const token = await AsyncStorage.getItem("userToken");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setTimeout(() => {
          setIsReady(true);
        }, 2000);
      }
    };

    fetchUserData_CheckActiveOrder();

    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // Recheck for active orders when app returns to the foreground
        fetchUserData_CheckActiveOrder();
      }
      appState.current = nextAppState;
    };

    AppState.addEventListener("change", handleAppStateChange);

    return () => {
      if (window.intervalId) clearInterval(intervalId);
      // AppState.remove('change', handleAppStateChange);
    };
  }, [isRoleChanged]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Alert.alert("No Internet Connection", "Please check your connection.");
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.activeTintColor} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey="pk_test_51Q0mkTEgTqpUY0IgW4AtWE1mfMbHEtxq50HDVdRSBr4R43oG23hhmLf4W57QphaiXJWT7efFKXcxXnJqsYVJ0rUe00lVjPrrrP"
        merchantIdentifier="merchant.identifier" // required for Apple Pay
        urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
      >
        <PaperProvider theme={paperTheme}>
          <NavigationContainer theme={paperTheme}>
            <UserProvider>
              <CartProvider>
                <Stack.Navigator
                  screenOptions={{ headerShown: false }}
                  initialRouteName={
                    isAuthenticated
                      ? "Main"
                      : hasOnboarded
                        ? "Login"
                        : "Onboarding"
                  }
                >
                  <Stack.Screen
                    name="Splash"
                    component={SplashScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Onboarding"
                    component={OnboardingComponent}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    initialParams={{
                      setIsRoleChanged: setIsRoleChanged,
                      isRoleChanged: isRoleChanged,
                    }}
                    name="SignupScreen"
                    component={SignupScreen}
                    options={{ headerShown: false }}
                  />
                  {/* <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: false }}/>
              <Stack.Screen name="EmailVerificationScreen" component={ EmailVerificationScreen} options={{ headerShown: false }}/> */}
                  <Stack.Screen
                    initialParams={{
                      setIsRoleChanged: setIsRoleChanged,
                      isRoleChanged: isRoleChanged,
                    }}
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="Main" options={{ headerShown: false }}>
                    {(props) => (
                      <>
                        {/* {userRole === 'customer' && (
                        <OngoingOrderDrawer />
                      )} */}
                        <MainTabNavigator {...props} role={userRole} />
                      </>
                    )}
                  </Stack.Screen>

                  <Stack.Screen
                    initialParams={{ setIsRoleChanged, isRoleChanged }}
                    name="SettingScreen"
                    component={SettingScreen}
                  />
                  <Stack.Screen
                    initialParams={{ setIsRoleChanged, isRoleChanged }}
                    name="PersonalData"
                    component={PersonalData}
                  />
                  <Stack.Screen name="SettingEdit" component={SettingEdit} />
                  <Stack.Screen
                    name="RestaurantMenuScreen"
                    component={RestaurantMenuScreen}
                  />
                  <Stack.Screen
                    name="MenuItemDetailScreen"
                    component={MenuItemDetailScreen}
                  />
                  <Stack.Screen
                    name="MenuAboutScreen"
                    component={MenuAboutScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="MenuCheckoutScreen"
                    component={MenuCheckoutScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="AddPaymentMethod"
                    component={AddPaymentMethodScreen}
                  />
                  <Stack.Screen name="Orders" component={OrdersScreen} />
                  <Stack.Screen
                    name="OrderDetails"
                    component={OrderDetailScreen}
                  />
                  <Stack.Screen
                    name="OngoingOrder"
                    component={OngoingOrderScreen}
                  />
                  <Stack.Screen name="Chat" component={ChatScreen} />
                </Stack.Navigator>
              </CartProvider>
            </UserProvider>
            {/* <Toast ref={(ref) => Toast.setRef(ref)} /> */}
          </NavigationContainer>
        </PaperProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
