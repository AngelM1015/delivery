import { subscriptions } from "../constants/api";
import client from "../client";

export class SubscriptionService {
  constructor(token) {
    this.token = token;
  }

  async getSubscriptionPlans() {
    const response = await client.get(subscriptions.plans, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      },
    });
    return response.data;
  }

  async createSubscription(paymentMethodId, priceId, productName) {
    const response = await client.post(subscriptions.create, {
      payment_method_id: paymentMethodId,
      price_id: priceId,
      product_name: productName
    }, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    return response.data;
  }

  async cancelSubscription() {
    const response = await client.post(subscriptions.cancel, {}, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    return response.data;
  }

  async getSubscriptionStatus() {
    const response = await client.get(subscriptions.status, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      },
    });
    return response.data;
  }
}