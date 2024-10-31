import { useMemo, useState, useEffect } from "react";
import client from "../client";
import useUser from "./useUser";
import { OrderService } from "../services/orders";

const useOrders = () => {
  const { loading: fetchingUser, role, token } = useUser()
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partnerOrders, setPartnerOrders] = useState([]);


  const OrderServiceClient = useMemo(() => {
    if (token && role) {
      return new OrderService(token, role)
    }
  }, [token, role])

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orders = await OrderServiceClient.fetchOrders();
      setOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerOrders = async () => {
    try {
      const orders = await OrderServiceClient.fetchPartnerOrders();
      setPartnerOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOrder = (action) => {
    return async (id) => {
      try {
        const url = `api/v1/orders/${id}/${action}`;
        await client.patch(url, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchOrders();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  }

  useEffect(() => {
    if (!fetchingUser) {
      fetchOrders()
    }
  }, [fetchingUser])

  return {
    role,
    orders,
    partnerOrders,
    loading,
    fetchOrders,
    fetchPartnerOrders,
    cancelOrder: handleOrder("cancel_order"),
    pickUpOrder: handleOrder("start_delivery"),
    deliverOrder: handleOrder("partner_deliver_order")
  }
}

export default useOrders