import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, Image, FlatList, ScrollView, Platform, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import GuestModeSignUpComponent from '../components/GuestModeSignUpComponent';
import { Icons } from '../constants/Icons';
import { COLORS } from '../constants/colors';
import { base_url, orders } from '../constants/api';
const SettingScreen = ({route}) => {

  const navigation = useNavigation();

  const [isActivityActive, setIsActivityActive] = useState(false);
  const [statusPopupVisible, setStatusPopupVisible] = useState(false);
  const { userRole, setUserRole } = useContext(UserContext);
  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${base_url}${orders.order}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrdersData(response.data);
      setFilteredOrders(response.data);
      console.log('orders=========', response.data)
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }) => {
    let statusText = '';
    let statusColor = '';

    switch (item.status) {
      case 'delivered':
        statusText = 'Completed';
        statusColor = 'black';
        break;
      case 'canceled':
        statusText = 'Canceled';
        statusColor = 'red';
        break;
      default:
        statusText = 'In Progress';
        statusColor = 'green';
        break;
    }

    return (
      <View style={styles.orderItem}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} >
          <Text style={styles.orderTitle}>Order ID {item.id}</Text>
          <View style={{backgroundColor:'#F09B00', padding: 10, borderRadius: 16}}>
            <Text style={styles.statusText }>{statusText}</Text>
          </View>
        </View>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
          <View style={{flexDirection:'row', alignItems:'center', marginTop: 15}}>
            <Image source={require('../assets/images/icon.png')} style={{width: 45,height: 45}}/>
            <View style={{marginLeft: 15, gap: 10}}>
              <Text style={{color:COLORS.black, fontSize: 16, fontWeight:'700'}}>Burger</Text>
              <Text style={{color:'#F09B00', fontSize: 14, fontWeight:'400'}}>$12.23</Text>
            </View>
          </View>
          <Text style={{color:COLORS.black, fontWeight:'400', fontSize:12}}>14 Items</Text>
        </View>
      </View>
    );
  };

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

  // const handleLogout = async () => {
  //   try {
  //     await AsyncStorage.removeItem('userToken');
  //     await AsyncStorage.removeItem('userRole');
  //     await AsyncStorage.removeItem('userId');
  //     await AsyncStorage.removeItem('hasOnBoarded');

  //     navigation.navigate('Login');
  //     console.log('Logged out successfully');
  //   } catch (error) {
  //     console.error('Error logging out:', error);
  //   }
  // };
  const handleLogout = () => {
    setModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('hasOnBoarded');
  
      navigation.replace('Login');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setModalVisible(false); 
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


  
  const profileOptions = [
    { icon: <Icons.PersonalData/>, text: 'Personal Data',navigateTo: 'PersonalData'  },
    { icon:  <Icons.SettingsIcon/>, text: 'Settings',navigateTo: 'SettingEdit' },
    { icon:  <Icons.ExtraCard/>, text: 'Extra Card' },
    { icon:  <Icons.HelpCenter/>, text: 'Help Center' },
    { icon:  <Icons.DeleteIcon/>, text: 'Request Account Deletion' },
    { icon:  <Icons.AdduserIcon/>, text: 'Add another account' },
  ];

  return (
    <View style={styles.container}>
      {/* {userRole === 'guest' ? (
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
      )} */}
      <View style={styles.header}>
        <Text style={styles.settingText}>Profile Setting</Text>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.profileImage}
        />
        <View style={{marginTop: 15}}>
          <Text style={styles.name}>Albert Stevano Bajefski</Text>
          <Text style={styles.email}>abcd1234@gmail.com</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{paddingBottom: 15, flexGrow: 1}}>
        <View style={styles.ordersContainer}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersHeaderText}>My Orders</Text>
            <TouchableOpacity onPress={()=>navigation.navigate('MenuOfRestaurantsScreen')}>
              <Text style={styles.ordersToggleText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text>No orders available</Text>}
            refreshing={loading}
          />
        </View>

        <View style={styles.profileOptionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity 
              key={option.text} 
              style={styles.profileOption}
              onPress={() => navigation.navigate(option.navigateTo)}
            >
              {option.icon}
              <View style={{flexDirection:'row', justifyContent:'space-between', width:'90%', alignItems:'center'}}>
                <Text style={styles.profileOptionText}>{option.text}</Text>
                <Icons.GotoIcon/>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.buttonContent}>
            <Icons.LogoutIcon style={styles.icon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </View>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icons.ClossIcon /> 
              </TouchableOpacity>
            </View>
              <Text style={{color:'#878787', fontFamily:'400', fontSize: 14, marginTop: 10}}>Do you want to log out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton2} onPress={handleConfirmLogout}>
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  orderTitle: {
    color:COLORS.black, 
    fontSize: 14,
    fontWeight: '400'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400'
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    justifyContent:'center',
    alignItems:'center'
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    fontWeight:'600',
    color: '#8F90A6',
    textAlign:'center'
  },
  ordersContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius:8,
    width: '90%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ordersHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ordersToggleText: {
    fontSize: 16,
    color: '#F09B00',
    fontWeight:'600'
  },
  ordersList: {
    padding: 10,
  },
  orderItem: {
    padding: 5,
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderPrice: {
    fontSize: 16,
    color: '#666',
  },
  orderStatus: {
    fontSize: 16,
    color: '#666',
  },
  profileOptionsContainer: {
    padding: 10,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profileOptionText: {
    fontSize: 16,
    color:'#101010',
    fontWeight:'600',
    marginLeft: 15,
  },
  logoutButton: {
    padding: 20,
    backgroundColor: '#F09B00',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 16,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonContent: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center', 
  },
  icon: {
    marginRight: 10, 
  },
  settingText: {
    color:'#101010',
    fontSize:18,
    fontWeight:'600',
    marginBottom: 20
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, 
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10, 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, 
  },
  modalIcon: {
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#D6D6D6', 
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginRight: 5,
  },
  cancelText: {
    color: COLORS.black,
    fontSize:18,
    textAlign: 'center',
    fontWeight: '700',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize:18,
    textAlign: 'center',
    fontWeight: '700',
  },
  logoutButton2: {
    backgroundColor: '#F09B00',
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginLeft: 5,
  },
});

export default SettingScreen;
