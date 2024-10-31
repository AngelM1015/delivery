// authContext.js

import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Check for an existing token on app start
    const bootstrapAsync = async () => {
      let userToken;
      try {
        userToken = await AsyncStorage.getItem("token");
      } catch (e) {
        // Restoring token failed
        console.error("Restoring token failed", e);
      }
      setAuthToken(userToken);
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    authToken,
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        await AsyncStorage.setItem("token", data.token);
      } else {
        throw new Error("Invalid email or password");
      }
    },
    signup: async (name, email, password) => {
      const response = await fetch(`${API_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        await AsyncStorage.setItem("token", data.token);
      } else {
        throw new Error("Failed to sign up");
      }
    },
    logout: async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: headers,
        });
        setAuthToken(null);
        await AsyncStorage.removeItem("token");
      }
    },
    storeToken: async (token) => {
      try {
        await AsyncStorage.setItem("token", token);
      } catch (error) {
        console.error("Failed to store the token:", error);
      }
    },
    getToken: async () => {
      try {
        return await AsyncStorage.getItem("token");
      } catch (error) {
        console.error("Failed to get the token:", error);
        return null;
      }
    },
    isLoggedIn: async () => {
      const token = await authContext.getToken();
      return !!token;
    },
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
