import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AddPaymentMethod from "./AddPaymentMethod";

const PaymentMethod = ({
  visible,
  onClose,
  paymentMethods,
  selectedPaymentMethod,
  onSelect,
}) => {
  const navigation = useNavigation();
  const [addPaymentMethodsModal, setAddPaymentMethodModal] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Payment Method</Text>
          <FlatList
            data={paymentMethods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.paymentMethodItem,
                  selectedPaymentMethod.id === item.id &&
                    styles.selectedPaymentMethodItem,
                ]}
                onPress={() => onSelect(item)}
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
                <Ionicons
                  name={
                    selectedPaymentMethod.id === item.id
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                />
              </TouchableOpacity>
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
      </View>
      <AddPaymentMethod
        isVisible={addPaymentMethodsModal}
        onClose={() => setAddPaymentMethodModal(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  modalTitle: {
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
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
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
  selectedPaymentMethodItem: {
    borderWidth: 1,
    borderColor: "#f09b00",
  },
  paymentMethodText: {
    fontSize: 16,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: "#ccc",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
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

export default PaymentMethod;
