import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url, auth } from "../constants/api";
import { UserContext } from "../context/UserContext";

const admin = {
  email: "mobileadmin@example.com",
  password: "password",
};

const partner = {
  email: "partner1@example.com",
  password: "password",
};

const customer = {
  email: "customer@example.com",
  password: "password",
};

const restaurant_owner1 = {
  email: "owner1@example.com",
  password: "encrypted_password",
};

const restaurant_owner3 = {
  email: "owner3@example.com",
  password: "encrypted_password",
};

const LoginScreen = ({ navigation }) => {
  // DEFENSIVE: Safely access context values with default fallbacks
  const contextValue = useContext(UserContext) || {};
  const { 
    setUserRole = () => {}, 
    setUserId = () => {}, 
    isRoleChanged = false, 
    setIsRoleChanged = () => {} 
  } = contextValue;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (email, password) => {
    // DEFENSIVE: Validate inputs
    if (!email || !password) {
      Alert.alert("Login Error", "Please enter both email and password");
      return;
    }
    
    try {
      console.log(`email ${email}`);
      let url = `${base_url}${auth.login}`;

      const response = await axios.post(url, {
        email,
        password,
      });

      // DEFENSIVE: Verify response data exists
      if (response?.data?.token) {
        console.log("Login Successful:", response.data);

        // DEFENSIVE: Wrap AsyncStorage operations in try/catch
        try {
          await AsyncStorage.setItem("userToken", response.data.token);
          await AsyncStorage.setItem("userRole", response.data.role || "guest");
          await AsyncStorage.setItem("userId", (response.data.user_id || "").toString());
          await AsyncStorage.setItem("userEmail", response.data.email || "");
          await AsyncStorage.setItem("userName", response.data.name || "");
          
          // DEFENSIVE: Check role before setting partner status
          if (response.data.role === 'partner') {
            const isActive = !!response.data.active; // Convert to boolean
            await AsyncStorage.setItem('status', isActive ? 'true' : 'false');
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
          // Continue with login even if storage fails
        }

        // DEFENSIVE: Safely call context functions
        if (typeof setUserRole === 'function') {
          setUserRole(response.data.role || "guest");
        }
        
        if (typeof setUserId === 'function') {
          setUserId((response.data.user_id || "").toString());
        }
        
        if (typeof setIsRoleChanged === 'function') {
          setIsRoleChanged(!isRoleChanged);
        }

        // DEFENSIVE: Check navigation before using
        if (navigation && typeof navigation.replace === 'function') {
          navigation.replace("Main");
        } else {
          console.error("Navigation is unavailable");
          Alert.alert("Error", "Navigation failed. Please restart the app.");
        }
      } else {
        Alert.alert("Login Failed", "No token received");
      }
    } catch (error) {
      console.log("Error details:", error);
      console.log("Error response:", error?.response);
      console.log("Error message:", error?.message);
      
      // DEFENSIVE: Safely extract error message
      let errorMessage = "An error occurred. Please try again.";
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message?.includes("Network")) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      Alert.alert("Login Error", errorMessage);
    }
  };

  const loginAsCustomer = () => {
    // DEFENSIVE: Check if customer object is valid
    if (customer?.email && customer?.password) {
      handleLogin(customer.email, customer.password);
    } else {
      Alert.alert("Error", "Customer login information is missing");
    }
  };
  
  const loginAsAdmin = () => {
    // DEFENSIVE: Check if admin object is valid
    if (admin?.email && admin?.password) {
      handleLogin(admin.email, admin.password);
    } else {
      Alert.alert("Error", "Admin login information is missing");
    }
  };
  
  const loginAsPartner = () => {
    // DEFENSIVE: Check if partner object is valid
    if (partner?.email && partner?.password) {
      handleLogin(partner.email, partner.password);
    } else {
      Alert.alert("Error", "Partner login information is missing");
    }
  };
  
  const loginAsRestaurantOwner1 = () => {
    // DEFENSIVE: Check if restaurant_owner1 object is valid
    if (restaurant_owner1?.email && restaurant_owner1?.password) {
      handleLogin(restaurant_owner1.email, restaurant_owner1.password);
    } else {
      Alert.alert("Error", "Restaurant owner 1 login information is missing");
    }
  };
  
  const loginAsRestaurantOwner3 = () => {
    // DEFENSIVE: Check if restaurant_owner3 object is valid
    if (restaurant_owner3?.email && restaurant_owner3?.password) {
      handleLogin(restaurant_owner3.email, restaurant_owner3.password);
    } else {
      Alert.alert("Error", "Restaurant owner 3 login information is missing");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={{ paddingTop: "40%" }}>
            <Text style={styles.title}>Login to Your {"\n"}account.</Text>
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
              onPress={() => {
                // DEFENSIVE: Check navigation before using
                if (navigation && typeof navigation.navigate === 'function') {
                  navigation.navigate("EmailVerificationScreen");
                }
              }}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            <CustomButton
              text="Sign In"
              onPress={() => handleLogin(email, password)}
            />
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  // DEFENSIVE: Check navigation before using
                  if (navigation && typeof navigation.navigate === 'function') {
                    navigation.navigate("SignupScreen");
                  }
                }}
              >
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 10,
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 400,
    color: "#8F90A6",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginTop: 20,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#F09B00",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  registerText: {
    fontSize: 14,
    color: "#F09B00",
    fontWeight: "600",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  quickLoginContainer: {
    marginTop: 20,
  },
  quickLoginText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  quickLoginButton: {
    paddingVertical: 5,
  },
  quickLoginButtonText: {
    color: "#4A90E2",
    fontSize: 16,
  },
});

export default LoginScreen;
