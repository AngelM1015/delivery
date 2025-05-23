import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Change from FontAwesome to Ionicons
import BackIcon from "../assets/svgs/backIcon.svg";

const Header = ({
  title,
  navigation,
  showBackIcon = true,
  showShareIcon = false,
}) => {
  // Function to open the website when share icon is clicked
  const openWebsite = () => {
    Linking.openURL("https://www.bigskyeats.delivery");
  };

  return (
    <View style={styles.header}>
      {showBackIcon && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon size={34} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {showShareIcon && (
        <TouchableOpacity onPress={openWebsite}>
          {/* Replace FontAwesome with Ionicons */}
          <Ionicons name="share-social-outline" size={24} color="#F09B00" />
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
