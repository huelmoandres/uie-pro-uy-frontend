import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const SECURE_STORE_KEYS = {
    ACCESS_TOKEN: 'judicial_access_token',
    REFRESH_TOKEN: 'judicial_refresh_token',
} as const;

let globalSignOut: (() => Promise<void>) | null = null;

export const setGlobalSignOut = (callback: () => Promise<void>) => {
    globalSignOut = callback;
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Reads the accessToken from SecureStore and injects it into every request.

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Captures 401 Unauthorized responses, clears stored tokens, and redirects to login.

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const isAuthRequest = error.config?.url?.includes('auth/login') ||
            error.config?.url?.includes('auth/register');

        if (error.response?.status === 401 && !isAuthRequest) {
            if (globalSignOut) {
                // Let React State handle the secure store wipe and redirect natively
                await globalSignOut();
            } else {
                // Fallback if context is not mounted
                await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
                await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
                router.replace('/(auth)/login');
            }
        }
        return Promise.reject(error);
    },
);
