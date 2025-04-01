import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Text, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const SuccessfulSignUpComponent = ({ visible, onClose, userName }) => {
  const animationRef = useRef(null);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.lottieContainer}>
            <LottieView
              ref={animationRef}
              source={require("./../assets/lottie-images/Welcome-Sign-With-A-Spinning-Star.json")}
              autoPlay
              loop
              speed={0.8}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.welcomeTitle}>
            Welcome to BigSkyEats!
          </Text>
          
          <Text style={styles.welcomeMessage}>
            {userName ? `Hi ${userName}, thanks for joining us!` : 'Your account has been created successfully!'}
          </Text>
          
          <Text style={styles.subMessage}>
            Get ready to explore delicious food from local restaurants.
          </Text>
          
          <Button 
            mode="contained" 
            onPress={onClose}
            style={styles.continueButton}
            labelStyle={styles.buttonLabel}
          >
            Continue
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lottieContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 16,
    color: '#777',
    marginBottom: 25,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#F09B00',
    paddingHorizontal: 30,
    marginTop: 10,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 3,
  }
});

export default SuccessfulSignUpComponent;
