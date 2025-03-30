import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";
import { Badge } from "react-native-paper";
import MenuOfRestaurantsScreen from "./MenuOfRestaurantsScreen";
import RestaurantMenuScreen from "./RestaurantMenuScreen";
import MenuItemDetailScreen from "./MenuItemDetailScreen";
import MenuCheckoutScreen from "./MenuCheckoutScreen";
import CartScreen from "./CartScreen";
import { useCart } from "../context/CartContext";
import AddPaymentMethodScreen from "./AddPaymentMethodScreen";
import OngoingOrderScreen from "./OngoingOrderScreen";
import ChatScreen from "./ChatScreen";
import MenuAboutScreen from "./MenuAboutScreen";

const MenuStack = createStackNavigator();

const CartIcon = ({ navigation }) => {
  const { cartItems } = useCart();
  console.log("cart icon");

  return (
    <View style={{ position: "absolute", bottom: 20, right: 20 }}>
      {cartItems.length > 0 && (
        <Badge
          size={25}
          style={{
            position: "absolute",
            top: -5,
            right: 0,
            backgroundColor: "orange",
          }}
        >
          {cartItems.length}
        </Badge>
      )}
    </View>
  );
};

function MenuStackNavigator() {

  return (
    <>
      <MenuStack.Navigator>
        <MenuStack.Screen
          name="MenuOfRestaurantsScreen"
          component={MenuOfRestaurantsScreen}
        />
        <MenuStack.Screen
          name="OngoingOrderScreen"
          component={OngoingOrderScreen}
          options={{ headerShown: false }}
        />
        <MenuStack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <MenuStack.Screen
          name="RestaurantMenuScreen"
          component={RestaurantMenuScreen}
        />
        <MenuStack.Screen
          name="MenuAboutScreen"
          component={MenuAboutScreen}
          options={({ navigation }) => ({
            headerLeft: () => null,
            headerRight: () => <CartIcon navigation={navigation} />,
          })}
        />
        <MenuStack.Screen
          name="CartScreen"
          component={CartScreen}
          options={{ headerShown: false }}
        />
        <MenuStack.Screen
          name="MenuCheckoutScreen"
          component={MenuCheckoutScreen}
          options={{ headerShown: false }}
        />
        <MenuStack.Screen
          name="AddPaymentMethodScreen"
          component={AddPaymentMethodScreen}
        />
      </MenuStack.Navigator>
    </>
  );
}

export default MenuStackNavigator;
