import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Lottie from "lottie-react-native";
import { Provider, Modal, Portal, Button, Paragraph, Text } from 'react-native-paper';

const { width, height } = Dimensions.get("window");

const OnboardingComponent = ({ navigation }) => {
  const [visible, setVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: null });

  const handleCompleteOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('Login');
  };

  const showModal = (title, message, action) => {
    setModalContent({ title, message, action });
    setVisible(true);
  };

  const hideModal = () => setVisible(false);

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
      backgroundColor: '#373837',
      image: (
        <View style={styles.lottie}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/pizza-slice.json')}
          />
        </View>
      ),
      title: 'Welcome to BigSkyEats!',
      subtitle: 'Discover a new way to explore and order from your favorite local restaurants in Big Sky.',
    },
    {
      backgroundColor: '#373837',
      image: (
        <View style={styles.lottie}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/burger-order-delivery.json')}
          />
        </View>
      ),
      title: 'Enable Location Services',
      subtitle: (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Allow location access to discover nearby restaurants and get faster delivery.</Text>
          <Button mode="contained" onPress={() => showModal(
            'Enable Location Services',
            'Allow location access to discover nearby restaurants and get faster delivery.',
            requestLocationPermission
          )} style={styles.enableButton}>Enable Location</Button>
        </View>
      ),
    },
    {
      backgroundColor: '#373837',
      image: (
        <View style={styles.lottie}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/fried-chicken-order-chat.json')}
          />
        </View>
      ),
      title: 'Stay Updated with Notifications',
      subtitle: (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Enable notifications to receive order updates, special offers, and important alerts.</Text>
          <Button mode="contained" onPress={() => showModal(
            'Enable Notifications',
            'Enable notifications to receive order updates, special offers, and important alerts.',
            requestNotificationPermission
          )} style={styles.enableButton}>Enable Notifications</Button>
        </View>
      ),
    },
    {
      backgroundColor: '#373837',
      image: (
        <View style={styles.lottie}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/online-food-order-selection.json')}
          />
        </View>
      ),
      title: 'Browse and Explore',
      subtitle: 'Easily browse menus, discover new places, and find your next meal.',
    },
    {
      backgroundColor: '#373837',
      image: (
        <View style={styles.lottie}>
          <Lottie
            style={styles.lottieAnimation}
            autoPlay
            loop
            source={require('./../assets/lottie-images/food-delivery-with-tea.json')}
          />
        </View>
      ),
      title: 'Place Your First Order',
      subtitle: 'Follow simple steps to place your first order and enjoy your meal.',
    },
  ];

  return (
    <Provider>
      <Onboarding
        containerStyles={{ paddingHorizontal: 15 }}
        onDone={handleCompleteOnboarding}
        onSkip={handleCompleteOnboarding}
        pages={onboardingPages}
      />
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>{modalContent.title}</Text>
          <Paragraph>{modalContent.message}</Paragraph>
          <Button mode="contained" onPress={() => { modalContent.action(); hideModal(); }} style={styles.modalButton}>Allow</Button>
          <Button mode="outlined" onPress={hideModal} style={styles.modalButton}>Cancel</Button>
        </Modal>
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  lottie: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.9,
    height: height * 0.5,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  subtitleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitleText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  enableButton: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 10,
  },
});

export default OnboardingComponent;
