import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Emoji from 'react-native-emoji';

const SplashScreen = ({ navigation }) => {
  const emojis = ['fries', 'pizza', 'hamburger'];
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [spinValue, navigation]);

  const getEmojiPosition = (index) => {
    const inputRange = [0, 1];
    const outputRange = [
      `0deg`,
      `${360 * (index + 1)}deg` // Each emoji rotates 1, 2, or 3 full circles
    ];
    const rotate = spinValue.interpolate({ inputRange, outputRange });

    return {
      transform: [
        { translateX: 60 }, // Adjust radius to move emojis outwards
        { rotate },
        { translateX: -120 }, // Move back to form a circle around the text
      ],
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
          <Animated.View key={emoji} style={[styles.emojiContainer, getEmojiPosition(index)]}>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1e26',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f8c852',
    fontSize: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: '#f8c852',
    fontSize: 20,
    textAlign: 'center',
  },
  emojisContainer: {
    position: 'absolute',
    width: 240, // Increased size to accommodate larger circle
    height: 240, // Same as width
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%', // Center on the screen
    left: '40%', // Center on the screen
    marginLeft: -120, // Adjust according to width/2
    marginTop: -120, // Adjust according to height/2
  },
  emojiContainer: {
    position: 'absolute',
  },
  emoji: {
    fontSize: 32,
  },
});

export default SplashScreen;
