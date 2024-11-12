import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {base_url, auth} from '../constants/api';

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

const LoginScreen = ({ navigation,route }) => {
  const {isRoleChanged,setIsRoleChanged}=route?.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (email, password) => {
    try {
      console.log(`email ${email}`);
      let url = `${base_url}${auth.login}`;

      const response = await axios.post(url, {
        email,
        password,
      });

      if (response.data && response.data.token) {
        console.log('Login Successful:', response.data);

        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userRole', response.data.role);
        await AsyncStorage.setItem('userId', response.data.user_id.toString());
        await AsyncStorage.setItem('userEmail', response.data.email);
        await AsyncStorage.setItem('userName', response.data.name);
        setIsRoleChanged(!isRoleChanged)
        navigation.replace('Main');
      } else {
        Alert.alert('Login Failed', 'No token received');
      }
    } catch (error) {
      console.log('Error details:', error);
      console.log('Error response:', error.response);
      console.log('Error message:', error.message);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.inner}>
      <View style={{paddingTop:'40%'}}>
        <Text style={styles.title}>Login to Your {'\n'}account.</Text>
        <Text style={styles.subtitle}>Please sign in to your account</Text>
        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <CustomInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('EmailVerificationScreen')}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
        <CustomButton text="Sign In" onPress={() => handleLogin(email, password)} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.quickLoginContainer}>
          <Text style={styles.quickLoginText}>Role Dev-tool component, Login as:</Text>
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
        </View> */}
       </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 10,
    lineHeight:46
  },
  subtitle: {
    fontSize: 16,
    fontWeight:400,
    color: '#8F90A6',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginTop:20
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#F09B00',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  registerText: {
    fontSize: 14,
    color: '#F09B00',
    fontWeight: '600',
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
