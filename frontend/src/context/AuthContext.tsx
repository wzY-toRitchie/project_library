import React, { createContext, useContext, useState, useMemo } from 'react';
import { clearTokenCache } from '../api';

interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
    accessToken: string;
    tokenType: string;
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                // Validate if user has required fields for new interface
                if (parsedUser && Array.isArray(parsedUser.roles)) {
                    return parsedUser;
                }
            }
        } catch (error) {
            console.error('Failed to parse user from localStorage', error);
        }
        localStorage.removeItem('user'); // Clear invalid data
        return null;
    });

    const login = (userData: User) => {
        clearTokenCache();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        clearTokenCache();
        setUser(null);
        localStorage.removeItem('user');
        localStorage.setItem('cart', JSON.stringify([]));
        window.dispatchEvent(new Event('auth:logout'));
    };

    const isAuthenticated = !!user;

    const isAdmin = useMemo(() => {
        if (!user || !user.roles) return false;
        return user.roles.some(role => {
            const normalized = role?.toUpperCase?.();
            return normalized === 'ROLE_ADMIN' || normalized === 'ADMIN';
        });
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
