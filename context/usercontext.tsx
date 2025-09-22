// /app/context/UserContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

interface UserContextProps {
    role: 'patient' | 'doctor' | null;
    setRole: (role: 'patient' | 'doctor') => void;
}

export const UserContext = createContext<UserContextProps>({
    role: null,
    setRole: async () => { }
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, setRoleState] = useState<'patient' | 'doctor' | null>(null);

    const setRole = async (newRole: 'patient' | 'doctor') => {
        setRoleState(newRole);
        await AsyncStorage.setItem('userRole', newRole);
    };

    // Load role from AsyncStorage on app start
    useEffect(() => {
        (async () => {
            const storedRole = await AsyncStorage.getItem('userRole');
            if (storedRole === 'patient' || storedRole === 'doctor') {
                setRoleState(storedRole);
            }
        })();
    }, []);

    return (
        <UserContext.Provider value={{ role, setRole }}>
            {children}
        </UserContext.Provider>
    );
};
