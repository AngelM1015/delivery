// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const MenuOfRestaurantsScreen = ({ navigation }) => {
//   const [restaurants, setRestaurants] = useState([]);

//   useEffect(() => {
//     const fetchRestaurants = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         const headers = {
//           'Authorization': `Bearer ${token}`
//         };
//         const response = await axios.get('https://de4a-2400-adc5-18a-ff00-fdfb-b8b5-d09b-b1c7.ngrok-free.app/api/v1/restaurants', { headers });
//         const restaurantsWithImages = response.data.map((restaurant) => ({
//           ...restaurant,
//           image: restaurant.image_url ? { uri: restaurant.image_url } : null,
//         }));
//         if (restaurantsWithImages.length % 2 !== 0) {
//           restaurantsWithImages.push({ id: -1 });
//         }
//         setRestaurants(restaurantsWithImages);
//       } catch (error) {
//         console.error('Error fetching restaurants:', error);
//       }
//     };

//     fetchRestaurants();
//   }, []);

//   const renderItem = ({ item }) => {
//     if (item.id === -1) {
//       return <View style={[styles.card, { backgroundColor: 'transparent' }]} />;
//     }

//     return (
//       <TouchableOpacity 
//         style={styles.card} 
//         onPress={() => navigation.navigate('RestaurantMenuScreen', { restaurantId: item.id })}
//       >
//         {item.image ? (
//           <Image source={item.image} style={styles.cardImage} />
//         ) : (
//           <View style={styles.noImageContainer}>
//             <Text style={styles.noImageText}>No Image Available</Text>
//           </View>
//         )}
//         <View style={styles.cardContent}>
//           <Text style={styles.cardTitle}>{item.name}</Text>
//           <Text style={styles.cardText}>{item.address}</Text>
//           <Text>delivery fee: $20</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <FlatList
//       data={restaurants}
//       renderItem={renderItem}
//       keyExtractor={item => item.id.toString()}
//       contentContainerStyle={styles.menuList}
//       numColumns={2}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   menuList: {
//     alignItems: 'center',
//     padding: 8,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     margin: 6,
//     width: '48%',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//     elevation: 3,
//   },
//   cardImage: {
//     width: '100%',
//     height: 120,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   noImageContainer: {
//     width: '100%',
//     height: 120,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   noImageText: {
//     color: '#666',
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   cardText: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 5,
//   },
// });

// export default MenuOfRestaurantsScreen;






import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Button, Card, Text, Searchbar } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { base_url, orders } from '../constants/api';
import { COLORS } from '../constants/colors';
import { Icons } from '../constants/Icons';
const MenuOfRestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]); 

  useEffect(() => {
    fetchRestaurants();
    fetchOrders();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('token...........', token)
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${base_url}api/v1/restaurants`, { headers });
      const restaurantsWithImages = response.data.map((restaurant, index) => ({
        ...restaurant,
        image: { url: `https://source.unsplash.com/random/800x600?restaurant&sig=${index}` },
      }));
      setRestaurants(restaurantsWithImages);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${base_url}${orders.order}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('token...........', token)
      console.log('orderssss==========',response.data)
      setOrdersData(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  
    const filtered = ordersData.filter(order =>
      order.order_items.some(item => 
        item.menu_item && item.menu_item.includes(query)
      ) || order.status.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOrders(filtered);
  
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  
    this.searchTimeout = setTimeout(() => {
      if (query && !recentSearches.includes(query)) {
        setRecentSearches([query, ...recentSearches].slice(0, 5));
      }
    }, 1000);
  };
  

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query); 
  };

  const handleDeleteSearch = (query) => {
    setRecentSearches(recentSearches.filter(search => search !== query));
  };

  const handleDeleteAllSearches = () => {
    setRecentSearches([]);
  };


  const renderRestaurant = ({ item: restaurant }) => {
    const isSelected = selectedRestaurant === restaurant.id;
    return (
     
      <TouchableOpacity
        onPress={() => setSelectedRestaurant(restaurant.id)} 
      >
        <Card
          style={[
            styles.restaurantCard,
            { backgroundColor: isSelected ? '#F09B00' : 'white', justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />
          <Text numberOfLines={1} style={styles.restaurantTitle}>{restaurant.name}</Text>
          <Text style={styles.restaurantSubtitle}>{restaurant.address}</Text>
        </Card>
      </TouchableOpacity>

    );
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
      <TouchableOpacity style={styles.orderItem} onPress={() => navigation.navigate('OngoingOrderScreen', { id: item.id })}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
          <View style={{flexDirection:'row', alignItems:'center', marginTop: 15}}>
            <Image source={require('../assets/images/icon.png')} style={{width: 60, height: 60}}/>
            <View style={{ marginLeft: 15, gap: 10 }}>
              <Text style={{ color: COLORS.black, fontSize: 20 }}>
                {item.order_items.map(orderItem => orderItem.menu_item).join(', ')}
              </Text>
              <Text style={{ color: 'grey', fontSize: 14 }}>{item.restaurant_name}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentSearch = ({ item }) => (
    <View style={styles.recentSearchItem}>

      <View style={{alignItems:'center', flexDirection:'row'}}>
        <Icons.RecenetSearch/>
        <TouchableOpacity onPress={() => handleRecentSearch(item)} style={{ flex: 1 }}>
          <Text style={styles.recentSearchText}>{item}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => handleDeleteSearch(item)}>
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{paddingHorizontal: 10}}>
   
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
          contentContainerStyle={{ paddingVertical: 10 }}
        />

        {recentSearches.length > 0 && (
          <View style={styles.recentSearchContainer}>
            <View style={styles.recentSearchHeader}>
              <Text style={styles.recentSearchTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={handleDeleteAllSearches}>
                <Text style={styles.deleteAllText}>Delete</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearch}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.recentSearchList}
            />
          </View>
        )}
        <Text style={styles.recentText}>My recent orders</Text>
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>No orders available</Text>}
          refreshing={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  horizontalList: {
    minHeight: 250,
  },
  restaurantCard: {
    width: 120,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 30
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    alignSelf: 'center'
  },
  restaurantTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  restaurantSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  orderItem: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentSearchContainer: {
    marginBottom: 20,
    marginTop: 30
  },
  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentSearchTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black
  },
  deleteAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary
  },
  recentSearchList: {
    marginBottom: 10,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  recentSearchText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: 600,
    flex: 1,
    marginLeft: 5
  },
  deleteText: {
    color: COLORS.delete,
    fontSize: 16,
    fontWeight: '700'
  },
  recentText: {
    color: COLORS.black,
    fontSize: 16, 
    fontWeight: '700',
    marginBottom: 5
  }
});

export default MenuOfRestaurantsScreen;
