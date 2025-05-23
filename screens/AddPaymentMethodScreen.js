import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import client from "../client";
import AddPaymentMethod from "../components/AddPaymentMethod";

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation();
  const [addPaymentMethodsModal, setAddPaymentMethodModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState();

  const fetchPaymentMethods = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await client.get(`api/v1/payments/get_payment_methods`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Available Payment Methods</Text>

        <FlatList
          style={{ height: "80%" }}
          data={paymentMethods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.paymentMethodItem}>
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
                  {item.last4 !== "N/A" && <Text>**** **** {item.last4}</Text>}
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
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#222",
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  extraCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    marginTop: 28,
    marginBottom: 10,
  },
  extraCardText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
});

export default AddPaymentMethodScreen;
