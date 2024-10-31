import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUser = () => {
  const [role, setRole] = useState();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState();
  const [userId, setUserId] = useState();

  useEffect(() => {
    fetchRole()
  }, [])

  const fetchRole = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const role = await AsyncStorage.getItem('userRole');
    const userId = await AsyncStorage.getItem('userId');
    setRole(role)
    setToken(token)
    setLoading(false)
    setUserId(userId)
  }
  return {
    role,
    loading,
    token,
    userId,
  }

}

export default useUser;