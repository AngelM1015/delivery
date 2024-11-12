import { restaurants } from "../constants/api";
import client from "../client";
import useUser from "../hooks/useUser";

export class RestaurantService {
  token = ""
  constructor(token) {
    this.token = token
  }

  async fetchRestaurants() {
    console.log('restuarant url ', restaurants.restaurant)
    const response = await client.get(restaurants.restaurant);
    return response.data
  }

  async fetchOwnerRestaurants() {
    const response = await client.get(restaurants.ownerRestaurants, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data
  }

}
