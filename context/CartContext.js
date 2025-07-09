import React, { createContext, useState, useContext } from "react";
import Toast from "react-native-toast-message";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurantId, setCartRestaurantId] = useState(null);

  // Helper function to compare modifiers
  const areModifiersEqual = (modifiers1, modifiers2) => {
    if (!modifiers1 && !modifiers2) return true;
    if (!modifiers1 || !modifiers2) return false;
    if (modifiers1.length !== modifiers2.length) return false;

    // Sort both arrays by modifierId for consistent comparison
    const sortedModifiers1 = [...modifiers1].sort((a, b) => a.modifierId - b.modifierId);
    const sortedModifiers2 = [...modifiers2].sort((a, b) => a.modifierId - b.modifierId);

    for (let i = 0; i < sortedModifiers1.length; i++) {
      const mod1 = sortedModifiers1[i];
      const mod2 = sortedModifiers2[i];

      if (mod1.modifierId !== mod2.modifierId) return false;

      // Sort options by id for consistent comparison
      const sortedOptions1 = [...mod1.options].sort((a, b) => a.id - b.id);
      const sortedOptions2 = [...mod2.options].sort((a, b) => a.id - b.id);

      if (sortedOptions1.length !== sortedOptions2.length) return false;

      for (let j = 0; j < sortedOptions1.length; j++) {
        if (sortedOptions1[j].id !== sortedOptions2[j].id) return false;
      }
    }

    return true;
  };

  const addToCart = (item) => {
    const newItem = { ...item, quantity: item.quantity || 1 }; // Set default quantity to 1

    setCartItems((currentItems) => {
      // Check if an identical item already exists
      const existingItemIndex = currentItems.findIndex((cartItem) => {
        // Check if it's the same item ID
        if (cartItem.id !== newItem.id) return false;

        // Check if modifiers are the same
        return areModifiersEqual(cartItem.selectedModifiers, newItem.selectedModifiers);
      });

      if (existingItemIndex !== -1) {
        // Item exists, increment quantity and recalculate total price
        const updatedItems = [...currentItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + newItem.quantity;

        // Calculate the base price per item (without quantity)
        const basePricePerItem = existingItem.price / existingItem.quantity;

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          price: basePricePerItem * newQuantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId) => {
    Toast.show({
      text1: "success",
      text2: `${cartItems[itemId].name} removed from cart ⛔`,
      visibilityTime: 1000,
      autoHide: true,
    });
    setCartItems((currentItems) =>
      currentItems.filter((item, index) => index !== itemId),
    );
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
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
