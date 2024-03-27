import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Emoji from 'react-native-emoji';
import { useNavigation } from '@react-navigation/native';


const SplashScreen = ({ navigation }) => {
  console.log('Navigation prop:', navigation);
  const emojiNames = ['fries', 'pizza', 'hamburger'];
  const spins = emojiNames.map(() => useRef(new Animated.Value(0)).current);

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
        ]),
        {
          iterations: Infinity,
        }
      )
    );

    animations.forEach(animation => animation.start());

    const timer = setTimeout(() => {
      console.log('Navigating to Login');
      navigation.replace('Login');
    }, 3000);

    return () => {
      animations.forEach(animation => animation.stop());
      clearTimeout(timer);
    };
  }, [spins, navigation]);

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
