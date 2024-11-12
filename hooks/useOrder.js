import { useState, useMemo } from "react";
import { OrderService } from "../services/orders";
import useUser from "./useUser";
import { useCart } from "../context/CartContext";
import Toast from "react-native-toast-message";
import { Alert } from "react-native";

const useOrder = () => {
  const { token, role } = useUser();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const OrderServiceClient = useMemo(() => {
    if (token && role) {
      return new OrderService(token, role)
    }
  }, [token, role])

  const createOrder = async (navigation, data, payment_method_id) => {
    setLoading(true);
    try {
      const response = await OrderServiceClient.createOrder(data, payment_method_id);
      if(response){
        console.log('response', response.data)
        clearCart();
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Order has been placed! 👋',
          position: 'top',
          visibilityTime: 1500
        });
        await navigation.navigate('Orders');
      }

    }catch (error) {
      console.error('Order submission error:', error.response.data.message);
      Alert.alert('Error', error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return{
    loading,
    createOrder
  }
}

export default useOrder;