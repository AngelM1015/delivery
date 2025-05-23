import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Emoji from "react-native-emoji";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }) => {
  const emojis = ["fries", "pizza", "hamburger"];
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();

    const timer = setTimeout(async () => {
      const token = await AsyncStorage.getItem("userToken");
      const hasOnboarded =
        (await AsyncStorage.getItem("hasOnboarded")) === "true";

      if (token) {
        // User is authenticated, go to Main
        navigation.replace("Main");
      } else if (hasOnboarded) {
        // User has completed onboarding but isn't logged in, go to Login
        navigation.replace("Login");
      } else {
        // First-time user, go to Onboarding
        navigation.replace("Onboarding");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [spinValue, navigation]);

  const getEmojiPosition = (index) => {
    const inputRange = [0, 1];
    const outputRange = [`0deg`, `${360 * (index + 1)}deg`];
    const rotate = spinValue.interpolate({ inputRange, outputRange });

    return {
      transform: [{ translateX: 60 }, { rotate }, { translateX: -120 }],
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>BigSkyEats</Text>
        <Text style={styles.subtitle}>Get Local Delivery</Text>
      </View>
      <View style={styles.emojisContainer}>
        {emojis.map((emoji, index) => (
          <Animated.View
            key={emoji}
            style={[styles.emojiContainer, getEmojiPosition(index)]}
          >
            <Emoji name={emoji} style={styles.emoji} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1e26",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#f8c852",
    fontSize: 36,
    textAlign: "center",
  },
  subtitle: {
    color: "#f8c852",
    fontSize: 20,
    textAlign: "center",
  },
  emojisContainer: {
    position: "absolute",
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    left: "40%",
    marginLeft: -120,
    marginTop: -120,
  },
  emojiContainer: {
    position: "absolute",
  },
  emoji: {
    fontSize: 32,
  },
});

export default SplashScreen;
