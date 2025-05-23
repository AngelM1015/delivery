import { useState, useMemo, useEffect } from "react";
import { OrderService } from "../services/orders";
import useUser from "./useUser";
import { useCart } from "../context/CartContext";
import Toast from "react-native-toast-message";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useOrder = () => {
  const { token, role } = useUser();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [recentOrder, setRecentOrder] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [isLastOrderFetchCalled, setIsLastOrderFetchCalled] = useState(false);

  const OrderServiceClient = useMemo(() => {
    if (token && role) {
      return new OrderService(token, role);
    }
  }, [token, role]);

  const createOrder = async (navigation, data) => {
    setLoading(true);
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
      console.error("Order submission error:", error.response.data.message);
      Alert.alert("Error", error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecentOrder = async () => {
    if (!OrderServiceClient) return;

    setLoading(true);
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
    // setError(null);

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
    recentOrder,
    lastOrder,
    createOrder,
    getRecentOrder,
    fetchLastOrder,
  };
};

export default useOrder;
