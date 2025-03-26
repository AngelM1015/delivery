import { useEffect, useMemo, useState } from "react";
import { RestaurantService } from "../services/restaurants";
import client from "../client";
import useUser from "./useUser";

const useRestaurants = () => {
  const { role, token } = useUser();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [ownerRestaurants, setOwnerRestaurants] = useState([]);

  const RestaurantServiceClient = useMemo(() => {
    if (token) {
      return new RestaurantService(token);
    } else if (role === "guest") {
      return new RestaurantService('');
    } else {
      return null;
    }
  }, [token]);

  const fetchRestaurants = async () => {
    if (!RestaurantServiceClient) {
      console.error("RestaurantServiceClient is not initialized");
      return;
    }

    setLoading(true);
    try {
      const Restaurants =
        role === "restaurant_owner"
          ? await RestaurantServiceClient.fetchOwnerRestaurants()
          : await RestaurantServiceClient.fetchRestaurants();

      setRestaurants(Restaurants);
      setSelectedRestaurant(Restaurants[0]?.id || null);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerRestaurants = async () => {
    if (!RestaurantServiceClient) {
      console.error("RestaurantServiceClient is not initialized");
      return;
    }
    setLoading(true);
    try {
      const response = await RestaurantServiceClient.fetchOwnerRestaurants();
      setRestaurants(response);
      setSelectedRestaurant(response[0].id);
    } catch (error) {
      console.error("Error fetching owner restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const url = role === 'restaurant_owner' ? `api/v1/restaurants/${restaurantId}/all_menu_items/` :`api/v1/restaurants/${restaurantId}/menu_items/`;
      const response = await client.get(url);

      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const changeStatus = async (restaurantId, menuItemId, newStatus) => {
    try {
      await client.patch(
        `api/v1/restaurants/${restaurantId}/menu_items/${menuItemId}/change_status`,
        {
          isenabled: newStatus,
        }
      );
      // Update the local state to reflect the change
      setMenuItems((prevMenuItems) =>
        prevMenuItems.map((item) =>
          item.id === menuItemId ? { ...item, isenabled: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };

  useEffect(() => {
    if (RestaurantServiceClient) {
      if (selectedRestaurant === null) {
        fetchRestaurants();
      } else {
        fetchMenuItems(selectedRestaurant);
      }
    }
  }, [RestaurantServiceClient, selectedRestaurant]);

  return {
    restaurants,
    menuItems,
    loading,
    selectedRestaurant,
    ownerRestaurants,
    setSelectedRestaurant,
    fetchRestaurants,
    fetchOwnerRestaurants,
    fetchMenuItems,
    changeStatus,
    setOwnerRestaurants,
    setMenuItems,
  };
};

export default useRestaurants;
