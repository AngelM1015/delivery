import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState("guest");
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedUserRole = await AsyncStorage.getItem("userRole");
        console.log("UserContext loading - userRole:", storedUserRole, "userId:", storedUserId);
        
        if (storedUserId) {
          setUserId(storedUserId);
        }
        
        if (storedUserRole) {
          setUserRole(storedUserRole);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Enhanced role setter that also updates AsyncStorage
  const updateUserRole = async (role) => {
    console.log("Setting user role to:", role);
    setUserRole(role);
    
    if (role) {
      await AsyncStorage.setItem("userRole", role);
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        userId, 
        setUserId, 
        userRole, 
        setUserRole: updateUserRole,
        isLoading 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
