import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { AuthService } from "@services";
import { SECURE_STORE_KEYS, setGlobalSignOut } from "@api/client";
import { logout as apiLogout } from "@api/auth.api";
import { queryClient } from "@providers/QueryProvider";
import { getDeviceId } from "@utils/deviceId";
import type { IUser } from "@app-types/auth.types";

interface AuthContextData {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  updateUserState: (user: IUser | null, newToken?: string | null) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    queryClient.clear();
    try {
      const deviceId = await getDeviceId().catch(() => undefined);
      await apiLogout(deviceId);
    } catch {
      // Ignorar errores de red; lo importante es limpiar el estado local.
    } finally {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
    setGlobalSignOut(signOut);
  }, [signOut]);

  async function restoreSession() {
    try {
      const storedToken = await SecureStore.getItemAsync(
        SECURE_STORE_KEYS.ACCESS_TOKEN,
      );
      if (storedToken) {
        setToken(storedToken);
        const userData = await AuthService.getCurrentUser();
        if (__DEV__) {
          console.log("[SubscriptionDebug] auth/me", {
            userId: userData.id,
            userEmail: userData.email,
          });
        }
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth restorative failure:", error);
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    } finally {
      setIsLoading(false);
    }
  }

  const updateUserState = (
    updatedUser: IUser | null,
    newToken?: string | null,
  ) => {
    setUser(updatedUser);
    if (newToken !== undefined) {
      setToken(newToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
