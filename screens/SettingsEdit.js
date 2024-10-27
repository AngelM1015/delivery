import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { Icons } from '../constants/Icons';

const SettingEdit = ({navigation}) => {
  const [pushNotification, setPushNotification] = useState(false);
  const [location, setLocation] = useState(true);

  const togglePushNotification = () => {
    setPushNotification(!pushNotification);
  };

  const toggleLocation = () => {
    setLocation(!location);
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backButton}>
                <Icons.BackIcon/>
            </TouchableOpacity>
        <Text style={styles.title}>Setting</Text>
        </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Push Notification</Text>
        <Switch value={pushNotification} onValueChange={togglePushNotification} />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Location</Text>
        <Switch value={location} onValueChange={toggleLocation} />
      </View>

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>Language</Text>
        <View style={styles.languageButton}>
          <Text style={styles.languageText}>English</Text>
          <Icons.GotoIcon/>
        </View>
      </TouchableOpacity>

      <Text style={styles.otherText}>Other</Text>

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>About Tickets</Text>
        <Icons.GotoIcon/>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>Privacy Policy</Text>
        <Icons.GotoIcon/>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}> Terms of Service</Text>
        <Icons.GotoIcon/>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign:'center',
    width:'70%'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingText: {
    fontSize: 14,
    color:'#000000',
    fontWeight: '600'
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    color:'#000000',
    fontWeight:'600',
    marginRight: 8,
  },
  otherText: {
    fontSize: 12,
    color: '#8F90A6',
    fontWeight: '400',
    marginTop: 25,
    marginBottom: 8,
    paddingHorizontal: 15
  },
});

export default SettingEdit;