import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import CustomButton from '../components/CustomButton';
import Header from '../components/Header';

const MenuCheckoutScreen = ({ navigation, route }) => {
  const { cartItems = [], orderDetails = {} } = route.params || {};

  const deliveryDetails = {
    name: 'Albert Stevano',
    phone: '+12 8347 2838 28',
    address: 'New York',
    houseNo: 'BC54 Berlin',
    city: 'New York City',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Header title="Checkout" navigation={navigation} showShareIcon={true} />
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* You deserve better meal text */}
        <Text style={styles.subtext}>You deserve better meal</Text>

        {/* Item Ordered Section */}
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

        {/* Details Transaction Section */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Details Transaction</Text>
          <View style={styles.transactionDetails}>
            <View style={styles.transactionRow}>
              <Text style={styles.detailText}>Cherry Healthy</Text>
              <Text style={styles.detailAmount}>${orderDetails.cherryHealthyPrice || '0.00'}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.detailText}>Driver</Text>
              <Text style={styles.detailAmount}>${orderDetails.driverFee || '0.00'}</Text>
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

        {/* Deliver to Section */}
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

        {/* Checkout Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            text="Checkout Now"
            onPress={() => {
              // Handle checkout logic
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
});

export default MenuCheckoutScreen;
