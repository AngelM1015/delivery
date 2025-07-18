import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import axios from "axios";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url, auth } from "../constants/api";
import SuccessfulSignUpComponent from "../components/SuccessfulSignUpComponent";

const SignupScreen = ({ navigation, route }) => {
  // Safely destructure route.params with default values
  const { isRoleChanged, setIsRoleChanged } = route?.params || {
    isRoleChanged: false,
    setIsRoleChanged: () => {},
  };
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [role, setRole] = useState("");

  const handleSignup = async () => {
    // Input validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      Alert.alert("Error", "Please fill in all fields and select a role");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const url = `${base_url}${auth.register}`;
      const response = await axios.post(url, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: confirmPassword,
        role,
      });

      if (response?.data?.token) {
        console.log("Signup Successful:", response.data);

        try {
          // Store user data
          await AsyncStorage.setItem("userToken", response.data.token);
          await AsyncStorage.setItem("userRole", response.data.role || "guest");
          await AsyncStorage.setItem(
            "userId",
            (response.data.user_id || "").toString(),
          );
          await AsyncStorage.setItem("userEmail", response.data.email || "");
          await AsyncStorage.setItem("userName", response.data.name || "");
        } catch (storageError) {
          console.error("Error storing user data:", storageError);
          // Continue anyway - we don't want to block signup if storage fails
        }

        // Update role state if the function exists
        if (typeof setIsRoleChanged === "function") {
          setIsRoleChanged(!isRoleChanged);
        }

        // Show success modal instead of immediately navigating
        setNewUserName(`${firstName} ${lastName}`);
        setShowSuccessModal(true);
      } else {
        Alert.alert("Error", "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      // Handle specific error messages from the API
      let errorMessage = "Signup failed. Please try again.";
      if (error?.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          errorMessage;
      } else if (error?.message?.includes("Network")) {
        errorMessage = "Network error. Please check your connection.";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to main screen after modal is dismissed
    if (navigation && typeof navigation.replace === "function") {
      navigation.replace("Main");
    } else {
      console.error("Navigation is unavailable");
      Alert.alert("Error", "Navigation failed. Please restart the app.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Please fill in the form to continue
            </Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput
              placeholder="First Name"
              value={firstName}
              setValue={setFirstName}
              secureTextEntry={false}
            />
            <CustomInput
              placeholder="Last Name"
              value={lastName}
              setValue={setLastName}
              secureTextEntry={false}
            />
            <CustomInput
              placeholder="Email"
              value={email}
              setValue={setEmail}
              secureTextEntry={false}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <CustomInput
              placeholder="Password"
              value={password}
              setValue={setPassword}
              secureTextEntry={true}
            />
            <CustomInput
              placeholder="Confirm Password"
              value={confirmPassword}
              setValue={setConfirmPassword}
              secureTextEntry={true}
            />
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Select Role</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {[
                  { label: "Customer", value: "customer" },
                  { label: "Partner", value: "partner" },
                  { label: "Restaurant Owner", value: "restaurant_owner" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => setRole(item.value)}
                  >
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: "#F09B00",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 6,
                        backgroundColor: "#fff",
                      }}
                    >
                      {role === item.value && (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: "#F09B00",
                          }}
                        />
                      )}
                    </View>
                    <Text style={{ fontSize: 15, color: "#333", marginRight: 12 }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <CustomButton
              text={loading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignup}
              disable={
                loading ||
                !firstName ||
                !lastName ||
                !email ||
                !password ||
                !confirmPassword ||
                !role
              }
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                if (navigation && typeof navigation.navigate === "function") {
                  navigation.navigate("Login");
                }
              }}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Success Modal */}
          <SuccessfulSignUpComponent
            visible={showSuccessModal}
            onClose={handleSuccessModalClose}
            userName={newUserName}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  formContainer: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#666",
    fontSize: 16,
  },
  loginText: {
    color: "#F09B00",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 5,
  },
});

export default SignupScreen;
