import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState('guest');

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            const storedUserRole = await AsyncStorage.getItem('userRole');
            console.log('in context user, userRole is: ', storedUserRole)
            if (storedUserId) {
                setUserId(storedUserId);
            }
            if (storedUserRole) {
                setUserRole(storedUserRole);
            }
        };

        fetchUserData();
    }, []);

    return (
        <UserContext.Provider value={{ userId, setUserId, userRole, setUserRole }}>
            {children}
        </UserContext.Provider>
    );
};
