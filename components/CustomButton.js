// CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View} from 'react-native';

const CustomButton = ({ text, onPress, disable = false }) => {
  return (
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        disabled={disable}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F09B00',
    borderRadius: 16,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    width:'90%',
    alignSelf:'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CustomButton;
