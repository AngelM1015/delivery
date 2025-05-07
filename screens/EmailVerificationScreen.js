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
import { Ionicons } from "@expo/vector-icons"; // Importing icon for back button

const EmailVerificationScreen = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerifyAccount = () => {
    // Handle account verification logic here
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Top Bar with Back Button */}
          <View style={{ paddingTop: "20%" }}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={28} color="black" />
              </TouchableOpacity>
              <Text style={styles.topBarText}>Top Bar</Text>
            </View>

            {/* Title and Subtitle */}
            <Text style={styles.title}>Email verification</Text>
            <Text style={styles.subtitle}>
              Enter the verification code we sent you on:
              {"\n"}Abcd****@gmail.com
            </Text>

            {/* Password Inputs */}
            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <CustomInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Verify Account Button */}
            <View style={styles.buttonContainer}>
              <CustomButton
                text="Verify Account"
                onPress={handleVerifyAccount}
              />
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
    // justifyContent: 'center',
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  topBarText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "500",
    color: "#101010",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#8F90A6",
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default EmailVerificationScreen;
