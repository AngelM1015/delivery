// sessions.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";
import { useAuth } from "./authContext"; // import useAuth from the context

export async function login(email, password) {
  const { setAuthToken } = useAuth(); // get setAuthToken from the context

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    await storeToken(data.token);
    setAuthToken(data.token); // Set the token in context
    return data;
  } else {
    throw new Error("Invalid email or password");
  }
}

export async function signup(name, email, password) {
  const { setAuthToken } = useAuth();

  const response = await fetch(`${API_URL}/users/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    await storeToken(data.token);
    setAuthToken(data.token);
    return data;
  } else {
    throw new Error("Failed to sign up");
  }
}

export async function logout() {
  const { setAuthToken } = useAuth();
  const token = await AsyncStorage.getItem("userToken");

  if (token) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: headers,
    });
    await AsyncStorage.removeItem("token");
    setAuthToken(null);
  }
}

async function storeToken(token) {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.error("Failed to store the token:", error);
  }
}

export async function getToken() {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (error) {
    console.error("Failed to get the token:", error);
    return null;
  }
}

export async function isLoggedIn() {
  const token = await getToken();
  return !!token;
}
