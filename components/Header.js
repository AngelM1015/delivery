// Header.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BackIcon from "../assets/svgs/backIcon.svg";

const Header = ({ title, navigation, showShareIcon = false }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon size={34} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {showShareIcon && (
        <TouchableOpacity>
          <FontAwesome name="share-alt" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    // backgroundColor: '#f9f9f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Header;
