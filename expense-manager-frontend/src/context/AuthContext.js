import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in on mount
        const storedUser = localStorage.getItem('expense_manager_current_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const result = await api.login(email, password);
        if (result.success) {
            setUser(result.user);
            localStorage.setItem('expense_manager_current_user', JSON.stringify(result.user));
        }
        return result;
    };

    const register = async (username, email, password) => {
        return await api.register(username, email, password);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('expense_manager_current_user');
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
