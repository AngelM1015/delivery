import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurantId, setCartRestaurantId] = useState(null);

  const addToCart = item => {
    const newItem = { ...item, quantity: item.quantity || 1 }; // Set default quantity to 1
    setCartItems(currentItems => [...currentItems, newItem]);
  };

  const removeFromCart = itemId => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartRestaurantId, setCartRestaurantId, addToCart, removeFromCart, updateItemQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
