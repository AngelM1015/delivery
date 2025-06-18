import React, { useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import { Card } from "react-native-paper";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url } from "../constants/api";

const AddPaymentMethod = ({ isVisible, onClose, onSuccess }) => {
  const [cardDetails, setCardDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const { createToken } = useStripe();

  const handleCardDetailsChange = (details) => {
    setCardDetails(details);
  };

  const addPaymentMethod = async () => {
    if (!cardDetails.complete) {
      Alert.alert("Error", "Please complete the card details");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No token found");
        return;
      }

      const { token: paymentToken, error } = await createToken({
        type: "Card",
        card: cardDetails,
      });

      if (error) {
        console.error("Error creating token:", error);
        Alert.alert("Error", error.message);
        return;
      }

      const response = await axios.post(
        `${base_url}api/v1/payments/add_payment_method`,
        {
          payment_method_token: paymentToken.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Alert.alert("Success", "Payment method added successfully");
        onSuccess?.(); // Call the success callback if provided
        onClose();
      } else {
        Alert.alert("Error", response.data.message || "Failed to add payment method");
      }
    } catch (error) {
      console.error(
        "Error adding payment method:",
        error.response?.data?.message || error.message,
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add payment method. Please try again.",
      );
    } finally {
      setLoading(false);
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
          <Card.Title
            title="Add Payment Method"
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: "4242 4242 4242 4242",
                expiry: "MM/YY",
                cvc: "CVC",
              }}
              cardStyle={styles.cardField}
              style={styles.cardFieldContainer}
              onCardChange={handleCardDetailsChange}
            />
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addPaymentMethod}
              disabled={!cardDetails.complete || loading}
              style={[
                styles.addButton,
                (!cardDetails.complete || loading) && styles.disabledButton
              ]}
            >
              <Text style={[styles.buttonText, { color: "white" }]}>
                {loading ? "Adding..." : "Add Card"}
              </Text>
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
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  card: {
    borderRadius: 10,
    elevation: 5,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardField: {
    backgroundColor: "#f8f8f8",
    textColor: "#000000",
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 30,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: "#F09B00",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  closeButton: {
    padding: 12,
    backgroundColor: "#D6D6D6",
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AddPaymentMethod;
