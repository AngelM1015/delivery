import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Icons } from "../constants/Icons";

const PersonalData = () => {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const genderOptions = ["Male", "Female", "Other"];

  const handleSave = () => {};

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setIsGenderModalVisible(false);
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
            style={{ width: 100, height: 100, alignSelf: "center" }}
          />
          <View style={styles.formContainer}>
            <View style={styles.formItem}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={(text) => setFullName(text)}
                placeholder="Enter your full name"
              />
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Date Of Birth</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={(text) => setDateOfBirth(text)}
                placeholder="Enter your date of birth"
              />
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={styles.genderInputContainer}
                onPress={() => setIsGenderModalVisible(true)}
              >
                <TextInput
                  value={gender}
                  style={{ flex: 1, width: "100%" }}
                  placeholder="Select your gender"
                  editable={false}
                />
                <Icons.DropdownIcon style={styles.icon} />
              </TouchableOpacity>
            </View>

            <Modal
              visible={isGenderModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setIsGenderModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={genderOptions}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleGenderSelect(item)}
                        style={styles.modalOption}
                      >
                        <Text style={styles.modalOptionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                  />
                </View>
              </View>
            </Modal>
            <View style={styles.formItem}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(text) => setPhone(text)}
                placeholder="Enter your phone number"
              />
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => setEmail(text)}
                placeholder="Enter your email"
              />
            </View>
            <View style={styles.formItem}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={(text) => setLocation(text)}
                placeholder="Enter your location"
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    marginTop: 50,
  },
  formItem: {
    marginBottom: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 20,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
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
