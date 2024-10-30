import { restaurants } from "../constants/api";
import client from "../client";

export class RestaurantService {

  async fetchRestaurants() {
    console.log('restuarant url ', restaurants.restaurant)
    const response = await client.get(restaurants.restaurant);
    return response.data
  }

}
