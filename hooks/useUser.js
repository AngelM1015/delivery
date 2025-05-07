import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUser = () => {
  const [role, setRole] = useState();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState();
  const [userId, setUserId] = useState();
  const [userEmail, setUserEmail] = useState();
  const [userName, setUserName] = useState();

  useEffect(() => {
    fetchRole();
  }, []);

  const fetchRole = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const role = await AsyncStorage.getItem("userRole");
    const userId = await AsyncStorage.getItem("userId");
    const userEmail = await AsyncStorage.getItem("userEmail");
    const userName = await AsyncStorage.getItem("userName");
    setRole(role);
    setToken(token);
    setLoading(false);
    setUserId(userId);
    setUserEmail(userEmail);
    setUserName(userName);
  };

  return {
    role,
    loading,
    token,
    userId,
    userEmail,
    userName,
  };
};

export default useUser;
