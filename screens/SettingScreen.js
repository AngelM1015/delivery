import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import GuestModeSignUpComponent from '../components/GuestModeSignUpComponent';

const SettingScreen = ({route}) => {
  
  const [isActivityActive, setIsActivityActive] = useState(false);
  const [statusPopupVisible, setStatusPopupVisible] = useState(false);
  const { userRole, setUserRole } = useContext(UserContext);
  const navigation = useNavigation();

  const toggleSwitch = async () => {
    try {
      setIsActivityActive(previousState => !previousState);
      setStatusPopupVisible(true);
      setTimeout(() => {
        setStatusPopupVisible(false);
      }, 2000);
    } catch (error) {
      console.error('Error toggling activity status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('hasOnBoarded');

      navigation.navigate('Login');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {userRole === 'guest' ? (
        <GuestModeSignUpComponent navigation={navigation} />
      ) : (
        <>
          <View style={styles.settingItem}>
            <Text style={styles.text}>Activity Status:</Text>
            <TouchableOpacity
              style={[styles.activityButton, { backgroundColor: isActivityActive ? '#4CAF50' : '#FF6347' }]}
              onPress={toggleSwitch}
            >
              <Text style={styles.activityButtonText}>{isActivityActive ? 'Active' : 'Inactive'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logoutButtonContainer}>
            <Button title="Logout" onPress={confirmLogout} color="#FF6347" />
          </View>
          {statusPopupVisible && (
            <View style={styles.popupContainer}>
              <Text style={styles.popupText}>{isActivityActive ? 'Status: Active' : 'Status: Inactive'}</Text>
            </View>
          )}
        </>
      )}
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
  activityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  activityButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  logoutButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  popupContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  popupText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingScreen;
