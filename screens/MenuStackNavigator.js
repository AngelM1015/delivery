import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from './menuscreen';
import RestaurantMenuScreen from './RestaurantMenuScreen';
import MenuItemDetailScreen from './MenuItemDetailScreen';
import { FAB } from 'react-native-paper';

const MenuStack = createStackNavigator();

function MenuStackNavigator() {
  return (
    <MenuStack.Navigator>
      <MenuStack.Screen 
        name="MenuScreen" 
        component={MenuScreen} 
        options={{ 
          headerLeft: () => null,
          headerRight: () => (
            <FAB
              small
              icon="cart"
              onPress={() => console.log('Pressed')}
              style={{ marginRight: 10 }}
            />
          )
        }} 
      />
      <MenuStack.Screen 
        name="RestaurantMenuScreen" 
        component={RestaurantMenuScreen}
        options={{
          headerRight: () => (
            <FAB
              small
              icon="cart"
              onPress={() => console.log('Pressed')}
              style={{ marginRight: 10 }}
            />
          )
        }}
      />
      <MenuStack.Screen 
        name="MenuItemDetailScreen" 
        component={MenuItemDetailScreen} 
        options={{ 
          headerRight: () => (
            <FAB
              small
              icon="cart"
              onPress={() => console.log('Pressed')}
              style={{ marginRight: 10 }}
            />
          )
        }} 
      />
    </MenuStack.Navigator>
  );
}

export default MenuStackNavigator;
