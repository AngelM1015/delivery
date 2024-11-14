import React, { useState, useEffect } from 'react';
import { Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, View, Image, FlatList, SafeAreaView, Switch } from 'react-native';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import PartnerOrders from '../components/PartnerOrders';
import { FontAwesome } from "@expo/vector-icons";
import useRestaurants from '../hooks/useRestaurants';
import { base_url } from '../constants/api';

const DashboardScreen = () => {
  const [role, setRole] = useState(null);
  const {
    selectedRestaurant,
    menuItems,
    restaurants,
    fetchRestaurants,
    setSelectedRestaurant,
    changeStatus,
    setMenuItems
  } = useRestaurants();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [backgroundImage ,setBackgroundImage] = useState('https://via.placeholder.com/150');

  useEffect(() => {
    const fetchRoleAndData = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setRole(role);
      if (role === 'restaurant_owner') {
        if(selectedRestaurant === null){
          console.log('in home screen use effetc')
          fetchRestaurants
        }
      } else {
        await fetchData(role);
      }
    };

    const fetchData = async (role) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        let endpoint = role === 'partner' ? 'orders/partner_orders' : null;
        if (endpoint) {
          const response = await axios.get(`http://localhost:3000/api/v1/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (role === 'partner') {
            setOrders(response.data);
            groupOrders(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndData();
  }, []);

  const groupOrders = (partnerOrders) => {
    const groupedOrders = partnerOrders.reduce((x, y) => {
      (x[y.status] = x[y.status] || []).push(y);
      return x;
    }, {});

    setCompletedOrders(groupedOrders.delivered?.length || 0);
    setCanceledOrders(groupedOrders.canceled?.length || 0);
  };

  const renderRestaurant = ({ item: restaurant }) => {
    console.log('restaurants in dashboard ', restaurants)
    const isSelected = selectedRestaurant === restaurant.id;
    const image_url = base_url + restaurant.image_url;
    if(isSelected){
      setBackgroundImage(image_url);
    }
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedRestaurant(restaurant.id)}
      >
        <Card
          style={[
            styles.restaurantCard,
            { backgroundColor: isSelected ? '#F09B00' : 'white', justifyContent:'center',alignItems:'center' },
          ]}
        >
          <Image source={{ uri: image_url}} style={styles.restaurantImage} />
          <Text numberOfLines={1} style={styles.restaurantTitle}>{restaurant.name}</Text>
          <Text style={styles.restaurantSubtitle}>{restaurant.address}</Text>
        </Card>
      </TouchableOpacity>
    );
  };
  

  const renderMenuItem = ({ item }) => {
    const price = item.item_prices?.length > 0 ? item.item_prices[0] : 'Not Available';
    const imageUrl = item.image_url ? base_url + item.image_url : 'https://via.placeholder.com/150'
    const rating = '4.9';
    const distance = '2km';

    return (
      <Card style={styles.menuCard}>
        <View style={styles.innerCardContainer}>
          <View style={styles.menuCardTop}>
            <Image source={{ uri: imageUrl }} style={styles.menuImage} />
            <View style={styles.switchContainer}>
                <Switch
                  trackColor={{ false: "#767577", true: "#F09B00" }}
                  thumbColor={item.isenabled ? "#ffffff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch(item)}
                  value={item.isenabled}
                  style={styles.switch}
                />
              </View>
          </View>
          <View style={styles.menuDetails}>
            <Text style={styles.menuTitle} numberOfLines={1}>{item.name}</Text>
            <View style={styles.menuInfo}>
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={14} color="gold" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
              <View style={styles.distanceContainer}>
                {/* <FontAwesome name="map-marker" size={14} color="gray" /> */}
                <Text style={styles.distanceText}>{distance}</Text>
              </View>
            </View>
            <Text style={styles.priceText}>${price}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const toggleSwitch = ({item}) => {
    // changeStatus(selectedRestaurant, item.id, !item.isenabled);
    // setMenuItems((prevItems) =>
    //   prevItems.map((menu) =>
    //     menu.id === item.id ? { ...menu, isenabled: !menu.isenabled } : menu
    //   )
    // );
  };

  const renderDashboard = () => {
    // if (loading) {
    //   return <Text>Loading...</Text>;
    // }

    if (role === 'partner') {
      return (
        <>
          <View style={styles.orderGroups}>
            <Text style={styles.canceledOrders}> {canceledOrders} Cancel</Text>
            <Text style={styles.completedOrders}>{completedOrders} Completed</Text>
          </View>
          <TouchableOpacity style={styles.orderHistoryButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.orderHistoryButtonText}>Order History</Text>
          </TouchableOpacity>
          <PartnerOrders
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            orders={orders}
          />
        </>
      );
    } else if (role === 'restaurant_owner') {
      return (
        <SafeAreaView>
          <Image
            source={{uri: backgroundImage}}
            style={styles.backgroundImage}
          />
          <View style={{ flex: 1, marginTop: 10 }}>
            <FlatList
              data={restaurants}
              renderItem={renderRestaurant}
              keyExtractor={(item) => item.id.toString()}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalListContainer}
            />

            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              ListEmptyComponent={<Text>No menu items available</Text>}
            />
          </View>
        </SafeAreaView>
      );
    } else if (role === 'admin') {
      return <Text>Hi Admin</Text>;
    } else {
      return <Text>Role-specific data not available.</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      {renderDashboard()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  orderGroups: {
    flexDirection: 'row',
    gap: 20,
    marginStart: 14
  },
  canceledOrders: {
    color: 'red',
    fontSize: 20
  },
  completedOrders: {
    color: 'green',
    fontSize: 20
  },
  orderHistoryButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'start',
    margin: 20,
  },
  orderHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backgroundImage: {
    width: '95%',
    height: 230,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  restaurantCard: {
    marginBottom: 15,
    marginStart: 10,
    padding: 10,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restaurantSubtitle: {
    fontSize: 12,
    color: 'gray',
  },
  menuCard: {
    flex: 1,
    margin: 10,
    padding: 6,
    borderRadius: 10,
    borderWidth: 0.1,
    shadowOpacity: 0,
    backgroundColor: '#fff',
    elevation: 3,
    width: 180,
  },
  innerCardContainer: {
    overflow: 'hidden',
    borderRadius: 10,
    gap: 8
  },
  menuCardTop: {
    position: 'relative',
  },
  menuImage: {
    width: '100%',
    height: 100,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  menuDetails: {
    padding: 2,
    gap: 4
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
  },
  priceText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F09B00',
  },
});

export default DashboardScreen;
