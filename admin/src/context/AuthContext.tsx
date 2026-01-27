'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(jsonParse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post('/login', credentials);
        const { access_token, user } = response.data;

        if (user.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    function jsonParse(str: string) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
