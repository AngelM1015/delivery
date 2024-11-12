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
      console.log('token in restaurant hook', token);
      return new RestaurantService(token);
    }
    return null;
  }, [token]);

  const fetchRestaurants = async () => {
    if (!RestaurantServiceClient) {
      console.error('RestaurantServiceClient is not initialized');
      return;
    }

    setLoading(true);
    console.log('in fetch restaurant');
    try {
      const Restaurants = await RestaurantServiceClient.fetchRestaurants();
      console.log('restaurant in restaurant hook', Restaurants);
      setRestaurants(Restaurants);
      setSelectedRestaurant(Restaurants[0]?.id || null);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerRestaurants = async () => {
    if (!RestaurantServiceClient) {
      console.error('RestaurantServiceClient is not initialized');
      return;
    }

    setLoading(true);
    try {
      const Restaurants = await RestaurantServiceClient.fetchOwnerRestaurants();
      setOwnerRestaurants(Restaurants);
    } catch (error) {
      console.error('Error fetching owner restaurants:', error);
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
      console.error('Error fetching menu items:', error);
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
    fetchMenuItems
  };
};

export default useRestaurants;
