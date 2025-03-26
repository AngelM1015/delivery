import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url, auth } from "../constants/api";

const SignupScreen = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isRoleChanged, setIsRoleChanged } = route?.params;

  const handleSignup = async () => {
    // Handle the sign-up logic here, such as calling an API
      let url = `${base_url}${auth.register}`;

      const response = await axios.post(url, {
        auth: {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: "customer",
        }
      });

      if (response.data && response.data.token) {
        console.log("Sign Up Successful:", response.data);

        await AsyncStorage.setItem("userToken", response.data.token);
        await AsyncStorage.setItem("userRole", response.data.role);
        await AsyncStorage.setItem("userId", response.data.user_id.toString());
        await AsyncStorage.setItem("userEmail", response.data.email);
        await AsyncStorage.setItem("userName", response.data.name);
        if(response.data.role === 'partner') AsyncStorage.setItem('status', 'active' ? 'true' : 'false');

        setIsRoleChanged(!isRoleChanged);
        navigation.replace("Main");
      } else {
          Alert.alert("Sign Up Failed", "Try Again");
      }
    console.log("Full Name:", firstName);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", response.data.role);
    console.log("token", response.data.token);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={{ paddingTop: "40%" }}>
            <Text style={styles.title}>Create your new {"\n"}account</Text>
            <Text style={styles.subtitle}>
              Create an account to start looking for the food you like
            </Text>

            <View style={styles.inputContainer}>
              <CustomInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <CustomInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
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
            </View>

            <CustomButton text="Register" onPress={handleSignup} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>I have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signInText}>Sign in</Text>
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
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 41.6,
    color: "#000000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#8F90A6",
    fontWeight: "400",
    marginBottom: 30,
    width: "80%",
  },
  inputContainer: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#000",
  },
  signInText: {
    fontSize: 14,
    color: "#F09B00",
    fontWeight: "600",
  },
});

export default SignupScreen;
