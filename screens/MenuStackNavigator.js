import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from './MenuScreen';
import RestaurantMenuScreen from './RestaurantMenuScreen';
import MenuItemDetailScreen from './MenuItemDetailScreen';
import { FAB, Badge } from 'react-native-paper';
import { View } from 'react-native';
import { useCart } from '../components/CartContext'; // Adjust the path as necessary
import CartScreen from './CartScreen'; // Adjust the import path as necessary


const MenuStack = createStackNavigator();

const CartIcon = ({ navigation }) => {
  const { cartItems } = useCart();
  return (
    <View>
      <FAB
        small
        icon="cart"
        onPress={() => navigation.navigate('CartScreen')}
        style={{ marginRight: 10 }}
      />
      {cartItems.length > 0 && (
        <Badge size={25} style={{ position: 'absolute', top: -5, right: 0 }}>
          {cartItems.length}
        </Badge>
      )}
    </View>
  );
};

function MenuStackNavigator() {
  return (
    <MenuStack.Navigator>
      <MenuStack.Screen 
        name="MenuScreen" 
        component={MenuScreen} 
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
      <MenuStack.Screen name="CartScreen" component={CartScreen} />
    </MenuStack.Navigator>
  );
}


export default MenuStackNavigator;
