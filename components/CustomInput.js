import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import EmailIcon from '../assets/svgs/emailIcon.svg';  // SVG Email Icon
import PasswordIcon from '../assets/svgs/passwordIcon.svg';  // SVG Password Icon

const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default', isPassword = false }) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {/* Conditionally Render Icons */}
      {placeholder === "Email" && (
        <EmailIcon style={styles.icon} width={24} height={24} />
      )}
      {placeholder === "Password" && (
        <TouchableOpacity onPress={toggleSecureEntry} style={styles.iconContainer}>
          {isSecure ? (
            <PasswordIcon style={styles.icon} width={24} height={24} />
          ) : (
            <PasswordIcon style={styles.icon} width={24} height={24} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#C7C9D9',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1, // Take up all the space
    padding: 17,
    fontSize: 16,
  },
  iconContainer: {
    padding: 10,
  },
  icon: {
    marginLeft: 10,
  },
});

export default CustomInput;
