import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    // Handle forgot password logic here
    console.log('Email for password reset:', email);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={{ paddingTop: '40%' }}>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we’ll send you {'\n'}confirmation code to reset your password
            </Text>

            {/* Reusable CustomInput component with margin */}
            <View style={styles.inputContainer}>
              <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            {/* Reusable CustomButton component with margin */}
            <View style={styles.buttonContainer}>
              <CustomButton text="Continue" onPress={handleContinue} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#101010',
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8F90A6',
    fontWeight: '400',
    marginBottom: 30,
  },
  inputContainer: {
    marginTop: 20,
    marginBottom: 20, // Add margin here to increase the space between input and button
  },
  buttonContainer: {
    marginTop: 70, // Add more margin if needed to increase the gap
  },
});

export default ForgotPasswordScreen;
