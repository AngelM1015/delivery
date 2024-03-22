import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Assuming you're using React Navigation

const SettingsScreen = () => {
  const [isSettingEnabled, setIsSettingEnabled] = useState(false);
  const navigation = useNavigation(); // Get navigation object

  const toggleSwitch = () => setIsSettingEnabled(previousState => !previousState);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Remove the stored token
      navigation.navigate('Login'); // Navigate to the Login screen
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.text}>Enable Feature X</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isSettingEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isSettingEnabled}
        />
      </View>
      {/* Add more setting items here */}

      {/* Logout button */}
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#FF6347" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
  logoutButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  // Add more styles as needed
});

export default SettingsScreen;
