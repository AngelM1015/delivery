import { useMemo, useState, useEffect } from "react";
import client from "../client";
import useUser from "./useUser";
import { OrderService } from "../services/orders";

const useOrders = () => {
  const { loading: fetchingUser, role, token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partnerOrders, setPartnerOrders] = useState([]);
  const [error, setError] = useState(null);

  const OrderServiceClient = useMemo(() => {
    if (token && role) {
      return new OrderService(token, role);
    }
  }, [token, role]);

  const fetchOrders = async () => {
    if (!OrderServiceClient) return;
    setLoading(true);
    setError(null);
    try {
      const orders = await OrderServiceClient.fetchOrders();
      setOrders(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerPendingOrders = async () => {
    if (!OrderServiceClient) return;
    setLoading(true);
    setError(null);
    try {
      const partnerOrders =
        await OrderServiceClient.fetchPartnerPendingOrders();
      setPartnerOrders(partnerOrders);
    } catch (error) {
      console.error("Error fetching partner pending orders:", error);
      setError("Failed to fetch partner orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = (action) => {
    return async (id) => {
      if (!OrderServiceClient) return;
      try {
        const url = `api/v1/orders/${id}/${action}`;
        await client.patch(
          url,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchOrders();
      } catch (error) {
        console.error(`Error performing ${action} on order ${id}:`, error);
      }
    };
  };

  useEffect(() => {
    if (!fetchingUser) {
      fetchOrders();
      if (role === "partner") {
        fetchPartnerPendingOrders();
      }
    }
  }, [fetchingUser, role]);

  return {
    role,
    orders,
    partnerOrders,
    loading,
    error,
    fetchOrders,
    fetchPartnerPendingOrders,
    cancelOrder: handleOrder("cancel_order"),
    pickUpOrder: handleOrder("pick_up_order"),
    deliverOrder: handleOrder("deliver_order"),
  };
};

export default useOrders;
