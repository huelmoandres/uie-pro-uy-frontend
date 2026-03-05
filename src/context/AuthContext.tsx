import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '@services';
import { SECURE_STORE_KEYS, setGlobalSignOut } from '@api/client';
import type { IUser, ILoginRequest, IRegisterRequest } from '@app-types/auth.types';

interface AuthContextData {
    user: IUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (data: ILoginRequest) => Promise<void>;
    signUp: (data: IRegisterRequest) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserState: (user: IUser) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        void restoreSession();
        setGlobalSignOut(signOut);
    }, []);

    async function restoreSession() {
        try {
            const storedToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
            if (storedToken) {
                setToken(storedToken);
                const userData = await AuthService.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth restorative failure:', error);
            await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
        } finally {
            setIsLoading(false);
        }
    }

    const signIn = async (data: ILoginRequest) => {
        const response = await AuthService.login(data);
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, response.accessToken);
        setToken(response.accessToken);

        // Fetch full user profile after login
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
    };

    const signUp = async (data: IRegisterRequest) => {
        const response = await AuthService.register(data);
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, response.accessToken);
        setToken(response.accessToken);

        // Fetch full user profile after registration
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
        setToken(null);
        setUser(null);
    };

    const updateUserState = (updatedUser: IUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token,
                signIn,
                signUp,
                signOut,
                updateUserState,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
