import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { base_url } from '../constants/api';

const NotificationSettingScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [textNotifications, setTextNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved notification preferences when screen mounts
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const pushSetting = await AsyncStorage.getItem('pushNotifications');
        const textSetting = await AsyncStorage.getItem('textNotifications');
        
        // If settings exist, parse them
        if (pushSetting !== null) {
          setPushNotifications(JSON.parse(pushSetting));
        }
        
        if (textSetting !== null) {
          setTextNotifications(JSON.parse(textSetting));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    
    loadNotificationSettings();
  }, []);

  // Toggle push notifications
  const togglePushNotifications = (value) => {
    // If trying to turn off push notifications when text is also off
    if (!value && !textNotifications) {
      Alert.alert(
        "Cannot Disable All Notifications",
        "At least one notification method must be enabled.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setPushNotifications(value);
    saveNotificationSettings('pushNotifications', value);
  };

  // Toggle text notifications
  const toggleTextNotifications = (value) => {
    // If trying to turn off text notifications when push is also off
    if (!value && !pushNotifications) {
      Alert.alert(
        "Cannot Disable All Notifications",
        "At least one notification method must be enabled.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setTextNotifications(value);
    saveNotificationSettings('textNotifications', value);
  };

  // Save notification settings to AsyncStorage and update server if needed
  const saveNotificationSettings = async (key, value) => {
    setIsLoading(true);
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(value));
      
      // Update settings on server
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const settings = {
          push_enabled: key === 'pushNotifications' ? value : pushNotifications,
          text_enabled: key === 'textNotifications' ? value : textNotifications
        };
        
        await axios.put(
          `${base_url}api/v1/users/update_notification_settings`,
          { notification_settings: settings },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert(
        "Error",
        "Failed to save notification settings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <Text style={styles.sectionDescription}>
          Choose how you want to receive notifications. At least one notification method must be enabled.
        </Text>
        
        <View style={styles.settingCard}>
          {/* Push Notifications Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications directly on your device
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#F09B00" }}
              thumbColor={pushNotifications ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={togglePushNotifications}
              value={pushNotifications}
              disabled={isLoading}
            />
          </View>
          
          {/* Text Notifications Toggle */}
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Text Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via SMS to your phone number
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#F09B00" }}
              thumbColor={textNotifications ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleTextNotifications}
              value={textNotifications}
              disabled={isLoading}
            />
          </View>
        </View>
        
        <Text style={styles.noteText}>
          Note: You will still receive important account-related notifications regardless of these settings.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40, // Same width as back button for balanced header
  },
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  settingCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default NotificationSettingScreen;
