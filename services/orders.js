import { orders } from "../constants/api";
import client from "../client";

export class OrderService {
  token = ""
  role = ""
  constructor(token, role) {
    this.token = token
    this.role = role
  }

  async fetchOrders() {
    if(this.role !== 'customer') {
      return []
    }
    const response = await client.get(orders.order, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.data
  }
}
