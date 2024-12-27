import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import client from "../client";
import AddPaymentMethod from "../components/AddPaymentMethod";

const AddPaymentMethodScreen = () => {
  const [addPaymentMethodsModal, setAddPaymentMethodModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState();

  const fetchPaymentMethods = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await client.get(
        `api/v1/payments/get_payment_methods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to fetch payment methods");
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  })

  return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* <Text style={styles.title}>Payment Methods</Text> */}
          <FlatList
            style={{height: '80%'}}
            data={paymentMethods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={styles.paymentMethodItem}
              >
                <View style={styles.paymentMethod}>
                  {item.brand === "Cash" ? (
                    <Ionicons name="cash" size={28} color="black" />
                  ) : (
                    <FontAwesome
                      name={"cc-" + item.brand.toLowerCase()}
                      size={24}
                      color="black"
                    />
                  )}
                  <View style={{ gap: 6 }}>
                    <Text style={styles.paymentMethodText}>{item.brand}</Text>
                    {item.last4 !== "N/A" && (
                      <Text>**** **** {item.last4}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.extraCard}
            onPress={() => setAddPaymentMethodModal(true)}
          >
            <MaterialCommunityIcons
              name="credit-card-plus"
              size={30}
              color="white"
            />
            <Text style={styles.extraCardText}>Add New Card</Text>
          </TouchableOpacity>
        </View>
        <AddPaymentMethod
          isVisible={addPaymentMethodsModal}
          onClose={() => setAddPaymentMethodModal(false)}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 40,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  paymentMethodItem: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginVertical: 4,
    borderWidth: 0.2,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethod: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 16,
    alignItems: "center",
  },
  extraCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
    backgroundColor: "#333",
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    justifyContent: "center",
  },
  extraCardText: {
    fontSize: 18,
    color: "#fff",
  },
});

export default AddPaymentMethodScreen;
