import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

// Define the token key consistently across both storage layers
const TOKEN_KEY = "userToken";

// Create the context object
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null); // Stores token in memory for quick access
  const [isLoading, setIsLoading] = useState(true); // Track initial loading state

  // Save token securely and clean up legacy AsyncStorage
  const saveToken = async (token) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);       // Store token securely
      await AsyncStorage.removeItem(TOKEN_KEY);               // Remove legacy copy
      return true;
    } catch (e) {
      console.error("Error saving token", e);
      return false;
    }
  };

  // Load token from SecureStore; fallback to AsyncStorage for old installs
  const getToken = async () => {
    try {
      let token = await SecureStore.getItemAsync(TOKEN_KEY);  // Try SecureStore first
      if (!token) {
        token = await AsyncStorage.getItem(TOKEN_KEY);        // Fallback to AsyncStorage
        if (token) await saveToken(token);                    // Migrate if needed
      }
      return token;
    } catch (e) {
      console.error("Error getting token", e);
      return null;
    }
  };

  // Remove token from both storages (logout flow)
  const deleteToken = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);           // Clear secure token
      await AsyncStorage.removeItem(TOKEN_KEY);               // Also clear legacy copy
      return true;
    } catch (e) {
      console.error("Error deleting token", e);
      return false;
    }
  };

  // Run once on app start to load token and set in-memory authToken
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userToken = await getToken();
        setAuthToken(userToken); // Keep token in memory for fast access
      } catch (error) {
        console.error("Failed to load auth token", error);
      } finally {
        setIsLoading(false); // Mark loading as complete regardless of outcome
      }
    };
    bootstrapAsync();
  }, []);

  // Login function - saves token and updates state
  const login = async (userData) => {
    try {
      if (userData && userData.token) {
        await saveToken(userData.token);
        setAuthToken(userData.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Comprehensive logout function
  const logout = async () => {
    try {
      // Clear auth token
      await deleteToken();
      
      // Clear all user-related data from AsyncStorage
      const userKeys = [
        "userId", 
        "userRole", 
        "userEmail", 
        "userName", 
        "status",
        "location"
      ];
      
      await AsyncStorage.multiRemove(userKeys);
      
      // Update state to reflect logout
      setAuthToken(null);
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  // Context value with all auth-related functions and state
  const authContext = {
    authToken,
    isLoading,
    isSignedIn: !!authToken,
    login,
    logout,
    saveToken,
    getToken
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;