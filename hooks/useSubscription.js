import { useState, useEffect } from "react";
import useUser from "./useUser";
import { SubscriptionService } from "../services/subscriptions";

const useSubscription = () => {
  const { token } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);

  const subscriptionService = new SubscriptionService(token);

  const fetchSubscriptionPlans = async () => {
    setPlansLoading(true);
    try {
      const plans = await subscriptionService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
      return plans;
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    } finally {
      setPlansLoading(false);
    }
  };

  const createSubscription = async (paymentMethodId, priceId) => {
    setLoading(true);
    try {
      const result = await subscriptionService.createSubscription(paymentMethodId, priceId);
      await fetchSubscriptionStatus();
      return result;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setLoading(true);
    try {
      const result = await subscriptionService.cancelSubscription();
      await fetchSubscriptionStatus();
      return result;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      return status;
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubscriptionStatus();
    }
  }, [token]);

  return {
    subscriptionStatus,
    subscriptionPlans,
    loading,
    plansLoading,
    createSubscription,
    cancelSubscription,
    fetchSubscriptionStatus,
    fetchSubscriptionPlans,
  };
};

export default useSubscription; 