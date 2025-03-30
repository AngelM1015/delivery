import React, { createContext, useState, useContext } from "react";
import Toast from "react-native-toast-message";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurantId, setCartRestaurantId] = useState(null);

  const addToCart = (item) => {
    const newItem = { ...item, quantity: item.quantity || 1 }; // Set default quantity to 1
    setCartItems((currentItems) => [...currentItems, newItem]);
  };

  const removeFromCart = (itemId) => {
    Toast.show({
      text1: "success",
      text2: `${cartItems[itemId].name} removed from cart ⛔`,
      visibilityTime: 1000,
      autoHide: true,
    });
    setCartItems((currentItems) =>
      currentItems.filter((item, index) => index !== itemId)
    );
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartRestaurantId,
        setCartRestaurantId,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
