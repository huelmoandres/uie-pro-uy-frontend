import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { queryClient } from "@providers/QueryProvider";

// ─── Constants ────────────────────────────────────────────────────────────────
// API_URL viene de app.config.ts extra (evita que Metro sobrescriba con .env.development).
// Fallback a process.env para EAS Build donde se inlinea correctamente.
const API_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:3000";

if (__DEV__) {
  console.log("[API Client] Base URL:", API_URL);
}

export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: "judicial_access_token",
  REFRESH_TOKEN: "judicial_refresh_token",
  BIOMETRIC_ENABLED: "judicial_biometric_enabled",
  /** Último push token registrado exitosamente en el backend. Evita llamadas redundantes. */
  PUSH_TOKEN: "judicial_push_token",
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
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Reads the accessToken from SecureStore and injects it into every request.

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(
      SECURE_STORE_KEYS.ACCESS_TOKEN,
    );
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// On 401: tries to refresh the access token once. If refresh fails, signs out.

let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

async function performSignOut() {
  queryClient.clear();
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.PUSH_TOKEN);
  if (globalSignOut) {
    await globalSignOut();
  } else {
    router.replace("/(auth)/login");
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const isAuthEndpoint =
      originalConfig?.url?.includes("/auth/login") ||
      originalConfig?.url?.includes("/auth/register") ||
      originalConfig?.url?.includes("/auth/refresh") ||
      originalConfig?.url?.includes("/auth/logout") ||
      originalConfig?.url?.includes("/auth/forgot-password") ||
      originalConfig?.url?.includes("/auth/reset-password");

    if (
      error.response?.status !== 401 ||
      isAuthEndpoint ||
      originalConfig?._retry
    ) {
      // Freemium soft-lock: no redirección global automática al paywall.
      // El paywall se muestra por acción explícita (Perfil / PremiumGateModal).
      return Promise.reject(error);
    }

    // Primer intento de refresh
    if (!isRefreshing) {
      isRefreshing = true;
      originalConfig._retry = true;

      try {
        const storedRefresh = await SecureStore.getItemAsync(
          SECURE_STORE_KEYS.REFRESH_TOKEN,
        );
        if (!storedRefresh) {
          await performSignOut();
          return Promise.reject(error);
        }

        const { data } = await axios.post<{
          accessToken: string;
          refreshToken?: string;
        }>(`${API_URL}/auth/refresh`, { refreshToken: storedRefresh });

        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.ACCESS_TOKEN,
          data.accessToken,
        );
        if (data.refreshToken) {
          await SecureStore.setItemAsync(
            SECURE_STORE_KEYS.REFRESH_TOKEN,
            data.refreshToken,
          );
        }

        // Notify queued requests
        refreshQueue.forEach((cb) => cb(data.accessToken));
        refreshQueue = [];

        originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalConfig);
      } catch {
        refreshQueue = [];
        await performSignOut();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Si ya hay un refresh en vuelo, encolar y esperar
    return new Promise((resolve, reject) => {
      refreshQueue.push((token: string) => {
        originalConfig.headers.Authorization = `Bearer ${token}`;
        resolve(apiClient(originalConfig));
      });
      // Timeout de seguridad para no bloquear indefinidamente
      setTimeout(() => reject(error), 10_000);
    });
  },
);
