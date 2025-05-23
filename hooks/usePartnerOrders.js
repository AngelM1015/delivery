import { useEffect, useMemo, useState } from "react";
import { OrderService } from "../services/orders";
import useUser from "./useUser";

const usePartnerOrders = () => {
  const [loading, setLoading] = useState(false);
  const [partnerOrders, setPartnerOrders] = useState([]);
  const { loading: fetchingUser, role, token } = useUser();

  const PartnerOrderClient = useMemo(() => {
    if (token && role === "partner") {
      console.log("Initializing OrderService with token and role");
      return new OrderService(token, role);
    }
    return null;
  }, [token, role]);

  const fetchAllPartnerOrders = async () => {
    if (!PartnerOrderClient) {
      console.error("PartnerOrderClient is not initialized");
      return;
    }

    setLoading(true);
    try {
      const partnerOrders = await PartnerOrderClient.fetchAllPartnerOrders();
      setPartnerOrders(partnerOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchingUser && PartnerOrderClient && role === "partner") {
      fetchAllPartnerOrders();
    }
  }, [fetchingUser, PartnerOrderClient]);

  return {
    loading,
    partnerOrders,
    fetchAllPartnerOrders,
  };
};

export default usePartnerOrders;
