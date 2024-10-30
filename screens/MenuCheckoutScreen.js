import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert} from 'react-native';
import CustomButton from '../components/CustomButton';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { base_url, restaurants } from '../constants/api';
import { ToggleButton } from 'react-native-paper';
import Toast from 'react-native-toast-message';


const MenuCheckoutScreen = ({ navigation, route }) => {
  const { clearCart } = useCart();
  const { cartItems = [], orderDetails = {} } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [orderType, setOrderType] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(null);

  const deliveryDetails = {
    name: 'Albert Stevano',
    phone: '+12 8347 2838 28',
    address: 'New York',
    houseNo: 'BC54 Berlin',
    city: 'New York City',
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${base_url}api/v1/payments/get_payment_methods`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const cashPaymentOption = {
        id: 'cash',
        brand: 'Cash',
        last4: 'N/A'
      };

      setPaymentMethods([cashPaymentOption, ...response.data]);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to fetch payment methods');
    }
  };

  const submitOrder = async () => {
    if (!orderType || !paymentMethod) {
      Alert.alert('Error', 'Please select an order type and payment method');
      return;
    }

    console.log('payment method', paymentMethod)
    try {
      const token = await AsyncStorage.getItem('userToken');

      const storedRestaurantId = await AsyncStorage.getItem('selectedRestaurantId');
      if (!storedRestaurantId) {
        Alert.alert('Error', 'No associated restaurant found');
        return;
      }

      const orderData = {
        order: {
          restaurant_id: parseInt(storedRestaurantId),
          delivery_address: orderType === 'delivery' ? '209 Aspen Leaf Dr, Big Sky, MT 59716' : '',
          total_price: orderDetails.totalPrice,
          address_id: 1, // fetch address from customer and then send that address
          order_type: orderType,
          payment_method: paymentMethod.brand === 'Cash' ? 'cash' : 'other',
          order_items_attributes: cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            order_item_modifiers_attributes: item.selectedModifiers.map(modifier => ({
              modifier_option_id: modifier.modifierId
            }))
          }))
        }
      };

      const response = await axios.post('http://192.168.150.220:3000/api/v1/orders/create_order',
        { order: orderData.order, payment_method_id: paymentMethod.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
      });

      clearCart();
      setOrderType(null);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Order has been placed! 👋',
        position: 'top',
        visibilityTime: 1500
      });
      navigation.navigate('Orders');
    } catch (error) {
      console.error('Order submission error:', error.response.data.message);
      Alert.alert('Error', error.response.data.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Checkout" navigation={navigation} showShareIcon={true} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtext}>You deserve better meal</Text>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Items Ordered</Text>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name || 'Unknown Item'}</Text>
                  <Text style={styles.itemPrice}>${item.price || '0.00'}</Text>
                </View>
                <Text style={styles.itemQuantity}>{item.quantity || 1} items</Text>
              </View>
            ))
          ) : (
            <Text>No items in cart</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Details Transaction</Text>
          <View style={styles.transactionDetails}>
            <View style={styles.transactionRow}>
              <Text style={styles.detailText}>Cherry Healthy</Text>
              <Text style={styles.detailAmount}>${orderDetails.cherryHealthyPrice || '0.00'}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.detailText}>Driver</Text>
              <Text style={styles.detailAmount}>$20.00</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.detailText}>Tax 10%</Text>
              <Text style={styles.detailAmount}>${orderDetails.tax || '0.00'}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.totalText}>Total Price</Text>
              <Text style={styles.totalAmount}>${orderDetails.totalPrice || '0.00'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.subHeader}>Deliver to :</Text>
          <View style={styles.deliverySection}>
            {Object.entries(deliveryDetails).map(([label, value], index) => (
              <View key={index} style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>{label.charAt(0).toUpperCase() + label.slice(1)}:</Text>
                <Text style={styles.deliveryDetail}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Order Type Selection */}
        <Text style={{ fontSize: 16, marginBottom: 10, paddingLeft: 10 }}>Select Order Type:</Text>
          <View style={styles.orderTypeContainer}>
            <View style={styles.orderTypeWrapper}>
              <ToggleButton.Group
                style={styles.orderTypeGroup}
                onValueChange={value => {
                  setOrderType(value);
                  if (value === 'delivery') {
                    setDeliveryFee(15);  // Set delivery fee for delivery option
                  } else {
                    setDeliveryFee(0);    // Set delivery fee for pickup option
                  }
                }}
                value={orderType}
              >
                <View style={styles.orderTypeItem}>
                  <ToggleButton icon="bike" value="delivery"/>
                  <Text style={styles.orderTypeLabel}>Delivery</Text>
                </View>

                <View style={styles.orderTypeItem}>
                  <ToggleButton icon="storefront" value="pickup"/>
                  <Text style={styles.orderTypeLabel}>Pick-Up</Text>
                </View>
              </ToggleButton.Group>
            </View>
          </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Payment Method</Text>
          <TouchableOpacity
            style={styles.paymentSelector}
            onPress={() => setShowPaymentMethods(!showPaymentMethods)}
          >
            <Text style={styles.selectedPaymentMethod}>{paymentMethod === 'cash' ? 'Cash' : `**** ${paymentMethod.last4}`}</Text>
            <Text style={styles.expandText}>{showPaymentMethods ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPaymentMethods && (
            <FlatList
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.paymentMethodItem,
                    paymentMethod === item.id && styles.selectedPaymentMethodItem
                  ]}
                  onPress={() => {
                    setPaymentMethod(item);
                    setShowPaymentMethods(false);
                  }}
                >
                  <Text style={styles.paymentMethodText}>{item.brand} {item.last4 !== 'N/A' ? `**** ${item.last4}` : ''}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            text="Checkout Now"
            onPress={() => {
              submitOrder()
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingTop: 50,
  },
  scrollContent: {
    padding: 20,
  },
  subtext: {
    textAlign: 'center',
    fontSize: 16,
    color: '#a0a0a0',
    marginVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  separator: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: '#F09B00',
    marginTop: 15,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  transactionDetails: {
    fontSize: 14,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
  detailAmount: {
    fontSize: 16,
    color: '#000',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#F09B00',
  },
  deliverySection: {
    marginTop: 10,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deliveryDetail: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
  },
  paymentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 10,
  },
  selectedPaymentMethod: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandText: {
    fontSize: 16,
    color: '#888',
  },
  paymentMethodItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedPaymentMethodItem: {
    backgroundColor: '#e0f7fa',
  },
  paymentMethodText: {
    fontSize: 16,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  orderTypeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  orderTypeGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  orderTypeItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  orderTypeLabel: {
    marginTop: 5,
    fontSize: 12,
  },
});

export default MenuCheckoutScreen;
