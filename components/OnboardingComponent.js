import React from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Lottie from 'lottie-react-native';
import { Provider, Button, Text } from 'react-native-paper';

const { width, height } = Dimensions.get("window");

const OnboardingComponent = ({ navigation }) => {
  const handleCompleteOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('Login');
  };

  const handleSkipOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'false');
    await AsyncStorage.setItem('userRole', 'guest');
    navigation.replace('Main', { role: 'guest' });
    Alert.alert(
      "Hey! We've noticed you hit skip",
      "We're glad you're excited to use our platform but we need access to some phone functionality. You can sign up at any time through the account page.",
      [
        {
          text: 'Skip',
          onPress: () => navigation.replace('Main', { role: 'guest' })
        },
        {
          text: 'Make an Account',
          onPress: () => navigation.navigate('SettingScreen')
        }
      ]
    );
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied. Unfortunately, you cannot use this app without allowing location access. You will be redirected to the main screen as a guest.');
      navigation.replace('Main', { role: 'guest' });
      return;
    }

    let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      alert('Background location access is required to get the driver to you. You will be redirected to the main screen as a guest.');
      navigation.replace('Main', { role: 'guest' });
      return;
    }

    alert('Location access granted. You can now use the app with full functionality.');
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to send notifications was denied');
    }
  };

  const onboardingPages = [
    {
      backgroundColor: '#373837',
      title: 'Welcome to BigSkyEats!',
      subtitle: 'Discover a new way to explore and order from your favorite local restaurants in Big Sky.',
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/pizza-slice.json')}
          />
        </View>
      ),
    },
    {
      backgroundColor: '#373837',
      title: 'Enable Location Services',
      subtitle: (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Allow location access to discover nearby restaurants and get faster delivery.</Text>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={requestLocationPermission} style={styles.enableButton}>Enable Location</Button>
          </View>
        </View>
      ),
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/burger-order-delivery.json')}
          />
        </View>
      ),
    },
    {
      backgroundColor: '#373837',
      title: 'Stay Updated with Notifications',
      subtitle: (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Enable notifications to receive order updates, special offers, and important alerts.</Text>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={requestNotificationPermission} style={styles.enableButton}>Enable Notifications</Button>
          </View>
        </View>
      ),
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/fried-chicken-order-chat.json')}
          />
        </View>
      ),
    },
    {
      backgroundColor: '#373837',
      title: 'Browse and Explore',
      subtitle: 'Easily browse menus, discover new places, and find your next meal.',
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/online-food-order-selection.json')}
          />
        </View>
      ),
    },
    {
      backgroundColor: '#373837',
      title: 'Place Your First Order',
      subtitle: 'Follow simple steps to place your first order and enjoy your meal.',
      image: (
        <View style={styles.lottieContainer}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/food-delivery-with-tea.json')}
          />
        </View>
      ),
    },
  ];

  return (
    <Provider>
      <Onboarding
        containerStyles={{ paddingHorizontal: 15 }}
        onDone={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
        pages={onboardingPages}
      />
    </Provider>
  );
};

const styles = StyleSheet.create({
  lottieContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.9,
    height: height * 0.4,
  },
  lottieAnimation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  subtitleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitleText: {
    color: 'white',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
  enableButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});

export default OnboardingComponent;
