import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddPaymentMethodScreen = ({ navigation }) => {
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

      const response = await axios.post('http://localhost:3000/api/v1/payments/add_payment_method', {
        payment_method_token: paymentToken.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        Alert.alert('Success', 'Payment method added successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error adding payment method:', error.response.data.message);
      Alert.alert('Oops!', error.response.data.message);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Add a New Payment Method" titleStyle={styles.cardTitle} />
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
        <Card.Actions>
          <Button mode="contained" onPress={addPaymentMethod} disabled={!cardDetails.complete} style={styles.button}>
            Add Payment Method
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  card: {
    borderRadius: 10,
    elevation: 5,
    backgroundColor: '#eeeee4',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardField: {
    backgroundColor: '#ccc',
    textColor: '#000000',
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 30,
  },
  button: {
    marginVertical: 10,
  },
});

export default AddPaymentMethodScreen;
