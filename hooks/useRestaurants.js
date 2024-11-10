import { useEffect, useMemo, useState } from "react";
import { RestaurantService } from "../services/restaurants";
import client from "../client";

const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const RestaurantServiceClient = useMemo(() => {
    return new RestaurantService();
  });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const Restaurants = await RestaurantServiceClient.fetchRestaurants();
      setRestaurants(Restaurants);
      setSelectedRestaurant(Restaurants[0].id);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const url = `api/v1/restaurants/${restaurantId}/menu_items/`;
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

  const getResturantByOwner = async (userId) => {
    try {
      setLoading(true);
      const response = await client.get(
        `api/v1/restaurants/get_resturant_by_owner`,
        {
          params: { user_id: userId },
        }
      );
      setRestaurants(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      console.error("Error  fetching restaurants by owner:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (selectedRestaurant === null) {
      fetchRestaurants();
    } else {
      fetchMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  return {
    restaurants,
    menuItems,
    setMenuItems,
    loading,
    selectedRestaurant,
    setSelectedRestaurant,
    fetchRestaurants,
    fetchMenuItems,
    changeStatus,
    getResturantByOwner,
  };
};

export default useRestaurants;
