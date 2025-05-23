import React from "react";
import { View, StyleSheet, Dimensions, Alert } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Lottie from "lottie-react-native";
import { Provider, Button, Text } from "react-native-paper";

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get("window");

const OnboardingComponent = ({ navigation }) => {
  // ✅ Called when onboarding is completed via swipe flow
  const handleCompleteOnboarding = async () => {
    await AsyncStorage.setItem("hasOnboarded", "true"); // Track completion
    navigation.replace("Login"); // Go to login screen
  };

  // ✅ Called when user taps "Skip" — sets guest role and routes to main
  const handleSkipOnboarding = async () => {
    await AsyncStorage.setItem("hasOnboarded", "false"); // Still track skip
    await AsyncStorage.setItem("userRole", "guest"); // Guest fallback
    navigation.replace("Main", { role: "guest" }); // Send to main UI
    Alert.alert(
      "Hey! We've noticed you hit skip",
      "We're glad you're excited to use our platform but we need access to some phone functionality. You can sign up at any time through the account page.",
      [
        { text: "Skip" },
        {
          text: "Make an Account",
          onPress: () => navigation.navigate("SignupScreen"), // CTA for conversion
        },
      ],
    );
  };

  // ✅ Only shows alert if permission denied — no longer forces redirection
  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location Required",
        "To use BigSkyEats fully, you’ll need to enable location in your phone settings later.",
      );
      return;
    }

    let { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      Alert.alert(
        "Background Location",
        "To find drivers while you're not using the app, background location must be granted. You can update this in settings.",
      );
      return;
    }

    Alert.alert(
      "Location Enabled",
      "You've enabled location services. You're all set!",
    );
  };

  // ✅ Non-blocking request for notification permission
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Notifications Blocked",
        "You won’t receive updates unless notifications are enabled in system settings.",
      );
    }
  };

  // ✅ Array of pages for the onboarding swiper
  const onboardingPages = [
    {
      backgroundColor: "#373837",
      title: "Welcome to BigSkyEats!",
      subtitle:
        "Discover a new way to explore and order from your favorite local restaurants in Big Sky.",
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require("./../assets/lottie-images/pizza-slice.json")}
          />
        </View>
      ),
    },
    {
      backgroundColor: "#373837",
      title: "Enable Location Services",
      subtitle: (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>
            Allow location access to discover nearby restaurants and get faster
            delivery.
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={requestLocationPermission} // Call permission logic
              style={styles.enableButton}
            >
              Enable Location
            </Button>
          </View>
        </View>
      ),
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require("./../assets/lottie-images/burger-order-delivery.json")}
          />
        </View>
      ),
    },
    {
      backgroundColor: "#373837",
      title: "Stay Updated with Notifications",
      subtitle: (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>
            Enable notifications to receive order updates, special offers, and
            important alerts.
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={requestNotificationPermission} // Call permission logic
              style={styles.enableButton}
            >
              Enable Notifications
            </Button>
          </View>
        </View>
      ),
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require("./../assets/lottie-images/fried-chicken-order-chat.json")}
          />
        </View>
      ),
    },
    {
      backgroundColor: "#373837",
      title: "Browse and Explore",
      subtitle:
        "Easily browse menus, discover new places, and find your next meal.",
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require("./../assets/lottie-images/online-food-order-selection.json")}
          />
        </View>
      ),
    },
    {
      backgroundColor: "#373837",
      title: "Place Your First Order",
      subtitle:
        "Follow simple steps to place your first order and enjoy your meal.",
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require("./../assets/lottie-images/food-delivery-with-tea.json")}
          />
        </View>
      ),
    },
  ];

  return (
    <Provider>
      <Onboarding
        containerStyles={{ paddingHorizontal: 15 }}
        onDone={handleCompleteOnboarding} // Triggered when swiper is completed
        onSkip={handleSkipOnboarding} // Triggered when "Skip" is pressed
        showSkip={true}
        showNext={true}
        showDone={true}
        pages={onboardingPages} // Custom pages with animations & actions
      />
    </Provider>
  );
};

// Styles for Lottie, text, and buttons
const styles = StyleSheet.create({
  lottieContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.9,
    height: height * 0.4,
  },
  lottieAnimation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  subtitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  subtitleText: {
    color: "white",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  enableButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f09b00",
  },
});

export default OnboardingComponent;
