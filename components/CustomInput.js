import React, { useState } from "react";
import { TextInput, View, TouchableOpacity, StyleSheet } from "react-native";
import EmailIcon from "../assets/svgs/emailIcon.svg"; // SVG Email Icon
import PasswordIcon from "../assets/svgs/passwordIcon.svg"; // SVG Password Icon

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  setValue, // Add this prop to handle both naming conventions
  secureTextEntry = false,
  keyboardType = "default",
  isPassword = false,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  // Handle both onChangeText and setValue props
  const handleChangeText = (text) => {
    // Try onChangeText first
    if (typeof onChangeText === 'function') {
      onChangeText(text);
    } 
    // Fall back to setValue if onChangeText is not provided
    else if (typeof setValue === 'function') {
      setValue(text);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || ""}
        value={value || ""}
        onChangeText={handleChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType || "default"}
        autoCapitalize="none"
      />
      {/* Conditionally Render Icons with defensive checks */}
      {placeholder === "Email" && EmailIcon && (
        <EmailIcon style={styles.icon} width={24} height={24} />
      )}
      {placeholder === "Password" && PasswordIcon && (
        <TouchableOpacity
          onPress={toggleSecureEntry}
          style={styles.iconContainer}
        >
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#C7C9D9",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
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
