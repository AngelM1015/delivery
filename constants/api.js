import { BACKEND_HOST } from "@env";
console.log("BACKEND_HOST", BACKEND_HOST);
export const base_url = `http://${BACKEND_HOST || "10.0.4.176"}:3000/`;
console.log("base_url_________", base_url);
export const auth = {
  login: "api/v1/auth/login",
  register: "api/v1/auth/register",
};

export const restaurants = {
  restaurant: "api/v1/restaurants",
  ownerRestaurants: "api/v1/restaurants/get_resturants_by_owner",
};

export const orders = {
  order: "api/v1/orders",
  partnerOrders: "api/v1/orders/partner_pending_orders",
  lastOrder: "api/v1/orders/last_order",
};

export const subscriptions = {
  create: "api/v1/subscriptions",
  cancel: "api/v1/subscriptions/cancel",
  status: "api/v1/subscriptions/status",
  plans: "api/v1/subscriptions/plans",
};

export const payments = {
  paymentMethods: "api/v1/payments/get_payment_methods",
};
