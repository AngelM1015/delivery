import React, { useState } from 'react';
import { View, Alert, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddPaymentMethod = ({ isVisible, onClose }) => {
  const [cardDetails, setCardDetails] = useState({});
  const { createToken } = useStripe();

  const handleCardDetailsChange = (details) => {
    setCardDetails(details);
  };

  const addPaymentMethod = async () => {
    if (!cardDetails.complete) {
      Alert.alert('Error', 'Please complete the card details');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const { token: paymentToken, error } = await createToken({
        type: 'Card',
        card: cardDetails,
      });

      if (error) {
        console.error('Error creating token:', error);
        Alert.alert('Error', error.message);
        return;
      }

      console.log('Payment method token:', paymentToken);

      const response = await axios.post('http://192.168.150.27:3000/api/v1/payments/add_payment_method', {
        payment_method_token: paymentToken.id,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Payment method added successfully');
        onClose();
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error adding payment method:', error.response?.data?.message);
      Alert.alert('Oops!', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Enter Your Card Details" titleStyle={styles.cardTitle} />
          <Card.Content>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: '4242 4242 4242 4242',
                expiry: 'MM/YY',
                cvc: 'CVC',
              }}
              cardStyle={styles.cardField}
              style={styles.cardFieldContainer}
              onCardChange={handleCardDetailsChange}
            />
          </Card.Content>
          <Card.Actions style={{margin: 'auto'}}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.ButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addPaymentMethod} disabled={!cardDetails.complete} style={styles.button}>
              <Text style={styles.ButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </Card.Actions>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    height: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  card: {
    borderRadius: 10,
    elevation: 5,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardField: {
    backgroundColor: '#ccc',
    textColor: '#000000'
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 30,
  },
  button: {
    backgroundColor: 'pink',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 20,
  },
  closeButton: {
    width: '40%',
    marginVertical: 10,
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 8,
  },
  ButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
});

export default AddPaymentMethod;
