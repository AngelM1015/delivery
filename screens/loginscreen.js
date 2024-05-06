import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const admin = {
  email: 'mobileadmin@example.com',
  password: 'password',
};

const partner = {
  email: 'partner1@example.com',
  password: 'password'
};

const customer = {
  email: 'customer@example.com',
  password: 'password'
};

const restaurant_owner1 = {
  email: 'owner1@example.com',
  password: 'encrypted_password'
};

const restaurant_owner3 = {
  email: 'owner3@example.com',
  password: 'encrypted_password'
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (email, password) => {
    try {
      let url = 'http://localhost:3000/api/v1/auth/login';
  
      const response = await axios.post(url, {
        email,
        password,
      });
  
      if (response.data && response.data.token) {
        console.log('Login Successful:', response.data);
        // Save token, role, and user_id in AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userRole', response.data.role);
        await AsyncStorage.setItem('userId', response.data.user_id.toString()); // Convert user_id to string
  
        navigation.replace('Main');
      } else {
        Alert.alert('Login Failed', 'No token received');
      }
    } catch (error) {
      Alert.alert(
        'Login Error',
        error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : 'An error occurred. Please try again.'
      );
    }
  };
  
  

  const loginAsCustomer = () => handleLogin(customer.email, customer.password);
  const loginAsAdmin = () => handleLogin(admin.email, admin.password);
  const loginAsPartner = () => handleLogin(partner.email, partner.password);
  const loginAsRestaurantOwner1 = () => handleLogin(restaurant_owner1.email, restaurant_owner1.password);
  const loginAsRestaurantOwner3 = () => handleLogin(restaurant_owner3.email, restaurant_owner3.password);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Your Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={() => handleLogin(email, password)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <View style={styles.quickLoginContainer}>
        <Text style={styles.quickLoginText}>Or Quick Login as:</Text>
        <TouchableOpacity style={styles.quickLoginButton} onPress={loginAsCustomer}>
          <Text style={styles.quickLoginButtonText}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLoginButton} onPress={loginAsPartner}>
          <Text style={styles.quickLoginButtonText}>Partner/Employee</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLoginButton} onPress={loginAsRestaurantOwner1}>
          <Text style={styles.quickLoginButtonText}>Restaurant Owner #1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLoginButton} onPress={loginAsRestaurantOwner3}>
          <Text style={styles.quickLoginButtonText}>Restaurant Owner #3</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLoginButton} onPress={loginAsAdmin}>
          <Text style={styles.quickLoginButtonText}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '85%',
    borderColor: '#4A90E2',
    borderWidth: 1,
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  quickLoginContainer: {
    marginTop: 20,
  },
  quickLoginText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  quickLoginButton: {
    paddingVertical: 5,
  },
  quickLoginButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
});

export default LoginScreen;
