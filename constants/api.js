export const base_url = "http://localhost:3000/";

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
