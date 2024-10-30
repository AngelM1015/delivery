import { useEffect, useMemo, useState } from "react";
import { RestaurantService } from "../services/restaurants";
import client from "../client";

const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const RestaurantServiceClient = useMemo(() => {
      return new RestaurantService()
  })

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const Restaurants = await RestaurantServiceClient.fetchRestaurants();
      setRestaurants(Restaurants);
      setSelectedRestaurant(Restaurants[0].id)
    } catch (error) {
      console.error('Error fetching restaurants:', error);
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
    if(selectedRestaurant === null){
      fetchRestaurants()
    } else {
      fetchMenuItems(selectedRestaurant)
    }
  }, [selectedRestaurant])

  return {
    restaurants,
    menuItems,
    loading,
    selectedRestaurant,
    setSelectedRestaurant,
    fetchRestaurants,
    fetchMenuItems
  }
}

export default useRestaurants