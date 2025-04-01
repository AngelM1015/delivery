import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { base_url, auth } from "../constants/api";
import axios from "axios";

// Define storage keys
const TOKEN_KEY = "userToken";
const USER_ROLE_KEY = "userRole";
const USER_ID_KEY = "userId";
const USER_EMAIL_KEY = "userEmail";
const USER_NAME_KEY = "userName";
const PARTNER_STATUS_KEY = "status";

// Create context
const AuthContext = createContext({});

// Custom hook for easy context access
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    userId: null,
    userRole: "guest",
    userName: null,
    userEmail: null,
    isLoading: true,
    partnerStatus: null
  });

  // Save auth data securely
  const saveAuthData = async (data) => {
    try {
      // Store token in SecureStore for security
      if (data.token) await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      
      // Store other user data in AsyncStorage
      const storagePromises = [];
      if (data.userRole) storagePromises.push(AsyncStorage.setItem(USER_ROLE_KEY, data.userRole));
      if (data.userId) storagePromises.push(AsyncStorage.setItem(USER_ID_KEY, data.userId.toString()));
      if (data.userEmail) storagePromises.push(AsyncStorage.setItem(USER_EMAIL_KEY, data.userEmail));
      if (data.userName) storagePromises.push(AsyncStorage.setItem(USER_NAME_KEY, data.userName));
      if (data.partnerStatus !== undefined) storagePromises.push(AsyncStorage.setItem(PARTNER_STATUS_KEY, data.partnerStatus ? 'true' : 'false'));
      
      await Promise.all(storagePromises);
      
      // Update state
      setAuthState(prevState => ({
        ...prevState,
        ...data,
        isLoading: false
      }));
    } catch (e) {
      console.error("Error saving auth data", e);
    }
  };

  // Load auth data on startup
  const loadAuthData = async () => {
    try {
      // Get token from SecureStore
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      
      // Get other data from AsyncStorage
      const [userRole, userId, userEmail, userName, partnerStatus] = await Promise.all([
        AsyncStorage.getItem(USER_ROLE_KEY),
        AsyncStorage.getItem(USER_ID_KEY),
        AsyncStorage.getItem(USER_EMAIL_KEY),
        AsyncStorage.getItem(USER_NAME_KEY),
        AsyncStorage.getItem(PARTNER_STATUS_KEY)
      ]);
      
      setAuthState({
        token,
        userRole: userRole || "guest",
        userId,
        userEmail,
        userName,
        partnerStatus: partnerStatus === 'true',
        isLoading: false
      });
    } catch (e) {
      console.error("Error loading auth data", e);
      setAuthState(prevState => ({
        ...prevState,
        isLoading: false
      }));
    }
  };

  // Sign in function
  const signIn = async (credentials) => {
    try {
      const { email, password } = credentials;
      const url = `${base_url}${auth.login}`;
      
      const response = await axios.post(url, { email, password });
      const data = response.data;
      
      if (data && data.token) {
        await saveAuthData({
          token: data.token,
          userRole: data.role,
          userId: data.user_id.toString(),
          userEmail: data.email,
          userName: data.name,
          partnerStatus: data.role === 'partner' ? data.status === 'active' : undefined
        });
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear SecureStore
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      
      // Clear AsyncStorage
      const keys = [USER_ROLE_KEY, USER_ID_KEY, USER_EMAIL_KEY, USER_NAME_KEY, PARTNER_STATUS_KEY];
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      
      // Reset state to default
      setAuthState({
        token: null,
        userId: null,
        userRole: "guest",
        userName: null,
        userEmail: null,
        isLoading: false,
        partnerStatus: null
      });
    } catch (e) {
      console.error("Error signing out", e);
    }
  };

  // Set guest mode
  const setGuestMode = async () => {
    try {
      await AsyncStorage.setItem(USER_ROLE_KEY, "guest");
      setAuthState(prevState => ({
        ...prevState,
        token: null,
        userId: null,
        userRole: "guest",
        userName: null,
        userEmail: null,
        partnerStatus: null
      }));
    } catch (e) {
      console.error("Error setting guest mode", e);
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    loadAuthData();
  }, []);

  // Value to be provided to consumers
  const authContextValue = {
    ...authState,
    signIn,
    signOut,
    setGuestMode,
    updateAuthState: (data) => saveAuthData(data)
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;