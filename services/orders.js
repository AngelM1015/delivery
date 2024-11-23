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
    return response.data;
  }

  async fetchPartnerPendingOrders() {
    if(this.role !== 'partner') {
      return []
    }
    const response = await client.get(orders.partnerOrders, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.data;
  }

  async fetchAllPartnerOrders() {
    if(this.role !== 'partner') {
      return []
    }
    const url = orders.order + '/partner_orders'
    console.log('in order service')
    const response = await client.get(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.data;
  }

  async createOrder(data) {
    const url = orders.order + "/create_order";
    const response = await client.post(url,
      {
        order: data
      },
      {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
  }

  async recentOnGoingOrder() {
    const url = orders.order + "/customer_recent_order"
    const response = await client.get(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.data;
  }
}
