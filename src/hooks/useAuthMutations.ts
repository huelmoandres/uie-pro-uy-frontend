import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@services";
import { useAuth } from "@context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { SECURE_STORE_KEYS } from "@api/client";
import { isLoginRequiresOtp } from "@api/auth.api";
import type { ILoginRequest, IRegisterRequest } from "@app-types/auth.types";
import {
  requestAndRegisterNotifications,
  clearCachedPushToken,
} from "@hooks/useNotifications";
import Purchases from "react-native-purchases";
import { getRevenueCatApiKey } from "@utils/subscription-context-helpers";
import { useAnalytics } from "@hooks/useAnalytics";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { updateUserState } = useAuth();
  const { identifyUser, trackEvent } = useAnalytics();

  return useMutation({
    mutationFn: async (data: ILoginRequest) => {
      const result = await AuthService.login(data);
      if (isLoginRequiresOtp(result)) {
        return result;
      }
      const tokens = result as { accessToken: string; refreshToken?: string };
      await SecureStore.setItemAsync(
        SECURE_STORE_KEYS.ACCESS_TOKEN,
        tokens.accessToken,
      );
      if (tokens.refreshToken) {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.REFRESH_TOKEN,
          tokens.refreshToken,
        );
      }
      // Actualizar estado ANTES de que mutateAsync resuelva, para evitar que
      // router.replace navegue con isAuthenticated=false y el layout redirija al login.
      const user = await AuthService.getCurrentUser();
      updateUserState(user, tokens.accessToken);

      // Sincronizar identidad con RevenueCat (UUID de Postgres)
      try {
        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          const apiKey = getRevenueCatApiKey();
          if (apiKey) Purchases.configure({ apiKey });
        }
        await Purchases.logIn(user.id);
      } catch (err) {
        console.warn("[Auth] RevenueCat logIn failed:", err);
      }

      identifyUser(user.id, { email: user.email });
      trackEvent("user_logged_in", { method: "email" });
      queryClient.setQueryData(AuthService.queryKeys.currentUser, user);
      return result;
    },
    onSuccess: async (data) => {
      if (isLoginRequiresOtp(data)) return;
      try {
        // Limpiar caché local para forzar POST al backend aunque el token de Expo
        // no haya cambiado. Garantiza que el token quede asociado al usuario actual
        // (ej: cambio de cuenta en el mismo dispositivo).
        await clearCachedPushToken();
        await requestAndRegisterNotifications();
      } catch (e) {
        console.warn("[Auth] Failed to register push token after login:", e);
      }
    },
  });
};

export const useVerifyLoginOtpMutation = () => {
  const queryClient = useQueryClient();
  const { updateUserState } = useAuth();
  const { identifyUser, trackEvent } = useAnalytics();

  return useMutation({
    mutationFn: async (data: { tempToken: string; otp: string }) => {
      const result = await AuthService.verifyLoginOtp(data.tempToken, data.otp);
      await SecureStore.setItemAsync(
        SECURE_STORE_KEYS.ACCESS_TOKEN,
        result.accessToken,
      );
      if (result.refreshToken) {
        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.REFRESH_TOKEN,
          result.refreshToken,
        );
      }
      // Actualizar estado ANTES de que mutateAsync resuelva (mismo fix que login).
      const user = await AuthService.getCurrentUser();
      updateUserState(user, result.accessToken);

      // Sincronizar identidad con RevenueCat (UUID de Postgres)
      try {
        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          const apiKey = getRevenueCatApiKey();
          if (apiKey) Purchases.configure({ apiKey });
        }
        await Purchases.logIn(user.id);
      } catch (err) {
        console.warn("[Auth] RevenueCat logIn failed:", err);
      }

      identifyUser(user.id, { email: user.email });
      trackEvent("user_logged_in", { method: "otp" });
      queryClient.setQueryData(AuthService.queryKeys.currentUser, user);
      return result;
    },
    onSuccess: async () => {
      try {
        await clearCachedPushToken();
        await requestAndRegisterNotifications();
      } catch (e) {
        console.warn("[Auth] Failed to register push token after login:", e);
      }
    },
  });
};

export const useRegisterMutation = () => {
  const { trackEvent } = useAnalytics();

  return useMutation({
    mutationFn: async (data: IRegisterRequest) => {
      return AuthService.register(data);
    },
    onSuccess: () => {
      trackEvent("user_registered");
    },
  });
};
