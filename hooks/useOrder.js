import { useState, useMemo, useEffect } from "react";
import { OrderService } from "../services/orders";
import useUser from "./useUser";
import { useCart } from "../context/CartContext";
import Toast from "react-native-toast-message";
import { Alert } from "react-native";

const useOrder = () => {
  const { token, role } = useUser();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentOrder, setRecentOrder] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [isLastOrderFetchCalled, setIsLastOrderFetchCalled] = useState(false);

  const OrderServiceClient = useMemo(() => {
    if (token && role) {
      return new OrderService(token, role);
    }
  }, [token, role]);

  const createOrder = async (navigation, data, onSurgeFeeUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrderServiceClient.createOrder(data);
      if (response) {
        console.log("response", response.data);
        clearCart();
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Order has been placed! 👋",
          position: "top",
          visibilityTime: 1500,
        });

        await navigation.navigate("Orders");
      }
    } catch (error) {
      console.error("Order submission error:", error.response);

      // Handle surge fee mismatch error
      if (error.response && error.response.data && error.response.data.error === 'Surge fee mismatch') {
        const expectedSurgeFee = error.response.data.expected;

        // Call the callback to update surge fee in the parent component
        if (onSurgeFeeUpdate) {
          onSurgeFeeUpdate(expectedSurgeFee);
        }

        setError("Surge fee mismatch - pricing updated");
      } else {
        setError(error.response?.data?.message || "Failed to create order");
        Alert.alert("Error", error.response?.data?.message || "Failed to create order");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRecentOrder = async () => {
    if (!OrderServiceClient) return;

    setLoading(true);
    setError(null);
    try {
      const response = await OrderServiceClient.recentOnGoingOrder();
      setRecentOrder(response);
    } catch (error) {
      console.error("Error fetching recent order", error);
      setError("Failed to fetch recent order.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastOrder = async () => {
    setIsLastOrderFetchCalled(true);
    if (!OrderServiceClient) return;
    setLoading(true);
    setError(null);

    try {
      const order = await OrderServiceClient.fetchLastOrder();
      console.log("last order ", order);
      setLastOrder(order);
    } catch (error) {
      console.error("Error fetching last order:", error);
      setError("Failed to fetch last order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLastOrderFetchCalled && lastOrder === null) {
      fetchLastOrder();
      setIsLastOrderFetchCalled(false);
    }
  }, [OrderServiceClient]);

  return {
    loading,
    error,
    recentOrder,
    lastOrder,
    createOrder,
    getRecentOrder,
    fetchLastOrder,
  };
};

export default useOrder;
