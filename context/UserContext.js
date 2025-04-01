import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../authContext";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState("guest");
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  
  // Get auth state from AuthContext
  const { isSignedIn, isLoading } = useAuth();

  // Reset user state when auth state changes
  useEffect(() => {
    if (!isLoading) {
      if (!isSignedIn) {
        // Reset to default state when logged out
        resetUserState();
      } else {
        // Fetch user data when logged in
        fetchUserData();
      }
    }
  }, [isSignedIn, isLoading]);

  // Reset all user state to defaults
  const resetUserState = () => {
    setUserId(null);
    setUserRole("guest");
    setUserName(null);
    setUserEmail(null);
  };

  // Fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedUserRole = await AsyncStorage.getItem("userRole");
      const storedUserName = await AsyncStorage.getItem("userName");
      const storedUserEmail = await AsyncStorage.getItem("userEmail");
      
      console.log("in context user, userRole is: ", storedUserRole);
      
      if (storedUserId) setUserId(storedUserId);
      if (storedUserRole) setUserRole(storedUserRole);
      if (storedUserName) setUserName(storedUserName);
      if (storedUserEmail) setUserEmail(storedUserEmail);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      // If there's an error, reset to defaults
      resetUserState();
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        userId, 
        setUserId, 
        userRole, 
        setUserRole,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        resetUserState
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using user context
export const useUser = () => useContext(UserContext);

export default UserContext;
