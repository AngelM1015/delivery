import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../client";
import Toast from "react-native-toast-message";

const PersonalData = ({navigation}) => {
  const [errors, setErrors] = useState({})
  const [userData, setUserData] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect( () => {
    fetchUserData();
  }, [])

  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');
    const url = `api/v1/users/${userId}`
    console.log('userId', userId);
    try {
      const response = await client.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setUserData({
        userName: response.data.username,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        email: response.data.email,
        phone: response.data.phone
      })
      console.log('response on getting personal data', response.data)

    } catch(error){
      Alert.alert('error while fetching personal data', error)
    }
  }

  const handleSave = async () => {
    const newErrors = {};

    if (!userData.userName) newErrors.userName = "Username is required.";
    if (!userData.firstName) newErrors.firstName = "First name is required.";
    if (!userData.lastName) newErrors.lastName = "Last name is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) return

    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const url = `api/v1/users/${userId}`;
      const data = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        username: userData.userName,
        phone: userData.phone,
      };

      console.log('user data', data);

      const response = await client.put(url, { user: data }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      AsyncStorage.setItem('userName', response.data.username);
      console.log('response on updating personal data', response.data);

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Data updated successfully! 👋",
        position: "top",
        visibilityTime: 1500,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error while updating personal data:', error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 422) {
          Alert.alert(
            "Validation Error",
            data?.message || "Fill Up the required fields. Please review your inputs."
          );
        } else if (status === 500) {
          Alert.alert(
            "Server Error",
            "Something went wrong on the server. Please try again later."
          );
        } else {
          Alert.alert("Error", `Unexpected error occurred: ${status}`);
        }
      } else if (error.request) {
        Alert.alert(
          "Network Error",
          "No response received. Please check your connection and try again."
        );
      } else {
        Alert.alert("Error", error.message || "An unknown error occurred.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Personal Data</Text>
          <Image
            source={require("../assets/images/icon.png")}
            style={{ width: '40%', height: '20%', alignSelf: "center", marginTop: '2%' }}
          />
          <View style={styles.formContainer}>
          <View style={styles.formItem}>
              <Text style={styles.label}>User Name</Text>
              <TextInput
                style={styles.input}
                value={userData.userName}
                onChangeText={(text) => setUserData({ ...userData, userName: text})}
                placeholder="Enter your user name"
              />
              {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={userData.firstName}
                onChangeText={(text) => setUserData({ ...userData, firstName: text})}
                placeholder="Enter your first name"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={userData.lastName}
                onChangeText={(text) => setUserData({ ...userData, lastName: text})}
                placeholder="Enter your last name"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                editable={false}
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text})}
                placeholder="Enter your email"
              />
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => setUserData({ ...userData, phone: text})}
                placeholder="Enter your phone number"
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: 20,
    marginTop: '3%'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    marginTop: '4%',
  },
  formItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000000",
  },
  input: {
    height: 50,
    borderColor: "#C7C9D9",
    borderWidth: 1,
    padding: 10,
    borderRadius: 16,
  },
  genderInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7C9D9",
    borderRadius: 16,
    paddingRight: 10,
    height: 50,
    padding: 10,
  },
  icon: {
    justifyContent: "flex-end",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: "#F09B00",
    padding: 20,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
});

export default PersonalData;
