import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

const GuestModeSignUpComponent = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up to Enjoy Full Features</Text>
      <Text style={styles.subtitle}>We're glad you're excited to use our platform. To enjoy full functionality, please sign up.</Text>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('SignUp', { role: 'customer' })}>
        Sign Up as Customer
      </Button>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('SignUp', { role: 'partner' })}>
        Sign Up as Driver
      </Button>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('SignUp', { role: 'restaurantOwner' })}>
        Sign Up as Restaurant Owner
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});

export default GuestModeSignUpComponent;
