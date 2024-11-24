import React from "react";
import { TextInput, StyleSheet } from "react-native";

const MenuItemSearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <TextInput
      style={styles.searchBar}
      placeholder="Search Menu Items"
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default MenuItemSearchBar;
