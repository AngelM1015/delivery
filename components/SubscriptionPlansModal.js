import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Icons } from '../constants/Icons';
import { COLORS } from '../constants/colors';
import client from '../client';
import useSubscription from '../hooks/useSubscription';
import { CardField, useStripe } from "@stripe/stripe-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url } from '../constants/api';

const SubscriptionPlansModal = ({ visible, onClose, initialSubscriptionStatus }) => {
  const { 
    subscriptionPlans,
    plansLoading,
    createSubscription,
    cancelSubscription,
    fetchSubscriptionPlans 
  } = useSubscription();
  const { createToken } = useStripe();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cardDetails, setCardDetails] = useState({});
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);

  useEffect(() => {
    if (visible && !initialSubscriptionStatus?.has_subscription) {
      fetchSubscriptionPlans();
      fetchPaymentMethods();
    }
  }, [visible, initialSubscriptionStatus?.has_subscription]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await client.get(`${base_url}api/v1/payments/get_payment_methods`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleCardDetailsChange = (details) => {
    setCardDetails(details);
  };

  const handleAddPaymentMethod = async () => {
    if (!cardDetails.complete) {
      Alert.alert("Error", "Please complete the card details");
      return;
    }

    try {
      setAddingPaymentMethod(true);
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

      const response = await client.post(
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
        setShowAddPaymentForm(false);
        setCardDetails({});
        fetchPaymentMethods();
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
      setAddingPaymentMethod(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Please select a plan");
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    try {
      await createSubscription(selectedPaymentMethod.id, selectedPlan.priceId, selectedPlan.productName);
      Alert.alert("Success", "Your subscription has been activated!");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to create subscription. Please try again later.");
    }
  };

  const handleCancelSubscription = async () => {
    if(initialSubscriptionStatus.cancelled) {
      Alert.alert("Error", "Your subscription has already been cancelled");
      return;
    }
    try {
      setIsCancelling(true);
      await cancelSubscription();
      Alert.alert("Success", "Your subscription will be cancelled at the end of the billing period");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to cancel subscription. Please try again later.");
    } finally {
      setIsCancelling(false);
    }
  };

  const renderPlanOption = (plan) => (
    <TouchableOpacity 
      key={plan.priceId}
      style={[
        styles.planOption,
        selectedPlan?.priceId === plan.priceId && styles.selectedPlan
      ]}
      onPress={() => setSelectedPlan(plan)}
    >
      <Text style={styles.planTitle}>{plan.productName}</Text>
      <Text style={styles.planPrice}>
        ${plan.amount}/{plan.interval}
      </Text>
      <Text style={styles.planFeatures}>• Unlimited Orders</Text>
      <Text style={styles.planFeatures}>• Priority Support</Text>
      <Text style={styles.planFeatures}>• Special Discounts</Text>
      <Text style={styles.planFeatures}>• {plan.description}</Text>
    </TouchableOpacity>
  );

  const renderPaymentMethod = (method) => {
    const brand = method.card?.brand || method.brand || 'CARD';
    const last4 = method.card?.last4 || method.last4;
    const expMonth = method.card?.exp_month || method.expiry_month;
    const expYear = method.card?.exp_year || method.expiry_year;

    if (!last4) {
      console.error('Invalid payment method format:', method);
      return null;
    }

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethod,
          selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethod
        ]}
        onPress={() => setSelectedPaymentMethod(method)}
      >
        <Text style={styles.paymentMethodText}>
          {brand.toUpperCase()} •••• {last4}
        </Text>
        {expMonth && expYear && (
          <Text style={styles.paymentMethodExpiry}>
            Expires {expMonth}/{expYear}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Subscription</Text>
              <TouchableOpacity onPress={onClose}>
                <Icons.ClossIcon />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
              {initialSubscriptionStatus?.has_subscription ? (
                <View style={styles.currentSubscription}>
                  <Text style={styles.sectionTitle}>Current Subscription</Text>
                  <View style={styles.subscriptionInfo}>
                    <Text style={[
                      styles.subscriptionStatus,
                      initialSubscriptionStatus.subscription?.cancel_at_period_end && styles.cancellingStatus
                    ]}>
                      {initialSubscriptionStatus.cancelled 
                        ? 'Cancelling at period end' 
                        : 'Active'}
                    </Text>
                    <Text style={styles.subscriptionDetails}>
                      Status: {initialSubscriptionStatus.subscription?.status}
                    </Text>
                    <Text style={styles.subscriptionDetails}>
                      Current period ends: {formatDate(initialSubscriptionStatus.subscription?.current_period_end)}
                    </Text>
                    {!initialSubscriptionStatus.subscription?.cancel_at_period_end && (
                      <TouchableOpacity
                        style={initialSubscriptionStatus.cancelled ? styles.cancelledSubscriptionButton : styles.cancelSubscriptionButton}
                        onPress={() => {
                          Alert.alert(
                            "Cancel Subscription",
                            "Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.",
                            [
                              {
                                text: "No",
                                style: "cancel"
                              },
                              {
                                text: "Yes",
                                onPress: handleCancelSubscription
                              }
                            ]
                          );
                        }}
                        disabled={initialSubscriptionStatus.cancelled}
                      >
                        {initialSubscriptionStatus.cancelled ? (
                          <Text style={styles.cancelledSubscriptionText}>
                            Cancelled
                          </Text>
                        ) : (
                          <Text style={styles.cancelSubscriptionText}>
                            {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                  <View style={styles.subscriptionPlans}>
                    {plansLoading ? (
                      <ActivityIndicator size="large" color="#F09B00" />
                    ) : subscriptionPlans.length > 0 ? (
                      subscriptionPlans.map(renderPlanOption)
                    ) : (
                      <Text style={styles.noPlansText}>No subscription plans available</Text>
                    )}
                  </View>

                  <View style={styles.paymentMethodsSection}>
                    <View style={styles.paymentMethodHeader}>
                      <Text style={styles.sectionTitle}>Payment Method</Text>
                      {!showAddPaymentForm && (
                        <TouchableOpacity 
                          style={styles.addPaymentButton}
                          onPress={() => setShowAddPaymentForm(true)}
                        >
                          <Text style={styles.addPaymentButtonText}>+ Add New</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {showAddPaymentForm ? (
                      <View style={styles.addPaymentForm}>
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
                        <View style={styles.paymentFormButtons}>
                          <TouchableOpacity 
                            style={styles.cancelPaymentButton} 
                            onPress={() => {
                              setShowAddPaymentForm(false);
                              setCardDetails({});
                            }}
                            disabled={addingPaymentMethod}
                          >
                            <Text style={styles.buttonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleAddPaymentMethod}
                            disabled={!cardDetails.complete || addingPaymentMethod}
                            style={[
                              styles.addPaymentSubmitButton,
                              (!cardDetails.complete || addingPaymentMethod) && styles.disabledButton
                            ]}
                          >
                            <Text style={[styles.buttonText, { color: "white" }]}>
                              {addingPaymentMethod ? "Adding..." : "Add Card"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.paymentMethods}>
                        {loadingPaymentMethods ? (
                          <ActivityIndicator size="large" color="#F09B00" />
                        ) : paymentMethods.length > 0 ? (
                          paymentMethods.map(renderPaymentMethod)
                        ) : (
                          <Text style={styles.noPaymentMethodsText}>
                            No payment methods available. Please add a payment method.
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            {!initialSubscriptionStatus?.has_subscription && (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    (!selectedPlan || !selectedPaymentMethod) && styles.disabledButton
                  ]}
                  onPress={handleSubscribe}
                  disabled={!selectedPlan || !selectedPaymentMethod}
                >
                  <Text style={styles.subscribeText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  scrollContent: {
    maxHeight: '70%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 15,
    marginTop: 10,
  },
  subscriptionPlans: {
    marginBottom: 20,
  },
  planOption: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#F09B00',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F09B00',
    marginBottom: 10,
  },
  planFeatures: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  paymentMethodsSection: {
    marginBottom: 20,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addPaymentButton: {
    backgroundColor: '#F09B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addPaymentButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethod: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: '#F09B00',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#D6D6D6',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  subscribeButton: {
    backgroundColor: '#F09B00',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelText: {
    color: COLORS.black,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  noPlansText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  noPaymentMethodsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  currentSubscription: {
    marginBottom: 20,
  },
  subscriptionInfo: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
  },
  subscriptionStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  cancellingStatus: {
    color: '#FF9800',
  },
  subscriptionDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cancelSubscriptionButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  cancelledSubscriptionButton: {
    backgroundColor: '#D6D6D6',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  cancelSubscriptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelledSubscriptionText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  addPaymentForm: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardField: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 10,
  },
  paymentFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelPaymentButton: {
    backgroundColor: '#D6D6D6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  addPaymentSubmitButton: {
    backgroundColor: '#F09B00',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SubscriptionPlansModal; 