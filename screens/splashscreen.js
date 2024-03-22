import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Emoji from 'react-native-emoji';

const SplashScreen = ({ navigation }) => { // Include navigation prop
  const emojiNames = ['fries', 'pizza', 'hamburger'];
  const spins = emojiNames.map(() => useRef(new Animated.Value(0)).current);
  console.log("Navigation prop:", navigation);

  useEffect(() => {
    const animations = spins.map((spin, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(spin, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            delay: index * 400,
          }),
          Animated.timing(spin, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(animation => animation.start());

    // Set a timeout to navigate to the Login screen
    const timer = setTimeout(() => {
      navigation.navigate('Login'); // Make sure this matches the name of your login route
    }, 3000); // Delay of 3 seconds

    // Cleanup function
    return () => {
      animations.forEach(animation => animation.stop());
      clearTimeout(timer);
    };
  }, [spins, navigation]); // Include navigation in the dependency array

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkyGub</Text>
      <View style={styles.loader}>
        {spins.map((spin, index) => (
          <Animated.View
            key={emojiNames[index]}
            style={{
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}>
            <Emoji name={emojiNames[index]} style={styles.emoji} />
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
  title: {
    color: '#f8c852',
    fontSize: 36,
    marginBottom: 10,
  },
  loader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 200,
  },
  emoji: {
    fontSize: 32,
  },
});

export default SplashScreen;
