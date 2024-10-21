import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { FAB, Badge } from 'react-native-paper';
import MenuOfRestaurantsScreen from './MenuOfRestaurantsScreen';
import RestaurantMenuScreen from './RestaurantMenuScreen';
import MenuItemDetailScreen from './MenuItemDetailScreen';
import MenuCheckoutScreen from './MenuCheckoutScreen';
import CartScreen from './CartScreen';
import { useCart } from '../context/CartContext';
import AddPaymentMethodScreen from './AddPaymentMethodScreen';

const MenuStack = createStackNavigator();

const CartIcon = ({ navigation }) => {
  const { cartItems } = useCart();

  return (
    <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
      {/* <FAB
        icon="cart"
        color='orange'
        backgroundColor='white'
        onPress={() => navigation.navigate('CartScreen')}
        style={{ marginRight: 10 }}
      /> */}
      {cartItems.length > 0 && (
        <Badge size={25} style={{ position: 'absolute', top: -5, right: 0, backgroundColor: 'orange' }}>
          {cartItems.length}
        </Badge>
      )}
    </View>
  );
};

function MenuStackNavigator() {
  const [isOrderScreenVisible, setOrderScreenVisible] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  const handleOpenOrderScreen = (order) => {
    setOrderDetails(order);
    setOrderScreenVisible(true);
  };

  const handleCloseOrderScreen = () => {
    setOrderScreenVisible(false);
  };

  return (
    <>
      <MenuStack.Navigator>
        <MenuStack.Screen
          name="MenuOfRestaurantsScreen"
          component={MenuOfRestaurantsScreen}
          options={({ navigation }) => ({
            headerLeft: () => null,
            headerRight: () => <CartIcon navigation={navigation} />
          })}
        />
        <MenuStack.Screen
          name="RestaurantMenuScreen"
          component={RestaurantMenuScreen}
          options={({ navigation }) => ({
            headerRight: () => <CartIcon navigation={navigation} />
          })}
        />
        <MenuStack.Screen
          name="MenuItemDetailScreen"
          component={MenuItemDetailScreen}
          options={({ navigation }) => ({
            headerRight: () => <CartIcon navigation={navigation} />
          })}
        />
        <MenuStack.Screen name="CartScreen" component={CartScreen}  options={{ headerShown: false }}/>
        <MenuStack.Screen name="MenuCheckoutScreen" component={MenuCheckoutScreen}  options={{ headerShown: false }}/>
        <MenuStack.Screen name="AddPaymentMethodScreen" component={AddPaymentMethodScreen} />
      </MenuStack.Navigator>
    </>
  );
}

export default MenuStackNavigator;
