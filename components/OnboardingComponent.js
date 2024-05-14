import React, { useEffect } from 'react';
import { Image, View, Text, TouchableOpacity } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

const OnboardingComponent = ({ navigation }) => {
  const handleCompleteOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('Login');
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
    }
  };

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to send notifications was denied');
    }
  };

  const onboardingPages = [
    {
      backgroundColor: '#a6e4d0',
      image: <Image source={require('../assets/favicon.png')} style={{ width: 200, height: 200 }} />,
      title: 'Welcome to Our App',
      subtitle: 'Discover a seamless experience to explore and order your favorite meals.',
    },
    {
      backgroundColor: '#fdeb93',
      image: <Image source={require('../assets/favicon.png')} style={{ width: 200, height: 200 }} />,
      title: 'Enable Geolocation Services',
      subtitle: (
        <View>
          <Text>We need your location to show nearby restaurants and faster delivery options.</Text>
          <TouchableOpacity onPress={requestLocationPermission}>
            <Text style={{ color: 'blue', marginTop: 10 }}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      backgroundColor: '#e9bcbe',
      image: <Image source={require('../assets/favicon.png')} style={{ width: 200, height: 200 }} />,
      title: 'Stay Updated with Notifications',
      subtitle: (
        <View>
          <Text>Allow notifications to receive order updates, special offers, and more.</Text>
          <TouchableOpacity onPress={requestNotificationPermission}>
            <Text style={{ color: 'blue', marginTop: 10 }}>Enable Notifications</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      backgroundColor: '#f5a623',
      image: <Image source={require('../assets/favicon.png')} style={{ width: 200, height: 200 }} />,
      title: 'Browse and Explore',
      subtitle: 'Easily browse menus, explore new restaurants, and discover great food.',
    },
    {
      backgroundColor: '#34ace0',
      image: <Image source={require('../assets/favicon.png')} style={{ width: 200, height: 200 }} />,
      title: 'Place Your First Order',
      subtitle: 'Follow simple steps to place your first order and enjoy your meal.',
    },
  ];

  return (
    <Onboarding
      onDone={handleCompleteOnboarding}
      onSkip={handleCompleteOnboarding}
      pages={onboardingPages}
    />
  );
};

export default OnboardingComponent;
