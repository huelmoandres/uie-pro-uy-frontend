import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@services";
import { useAuth } from "@context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { SECURE_STORE_KEYS } from "@api/client";
import { isLoginRequiresOtp } from "@api/auth.api";
import type { ILoginRequest, IRegisterRequest } from "@app-types/auth.types";
import { requestAndRegisterNotifications } from "@hooks/useNotifications";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { updateUserState } = useAuth();

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
      queryClient.setQueryData(["currentUser"], user);
      return result;
    },
    onSuccess: async (data) => {
      if (isLoginRequiresOtp(data)) return;
      try {
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
      queryClient.setQueryData(["currentUser"], user);
      return result;
    },
    onSuccess: async () => {
      try {
        await requestAndRegisterNotifications();
      } catch (e) {
        console.warn("[Auth] Failed to register push token after login:", e);
      }
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: IRegisterRequest) => {
      return AuthService.register(data);
    },
  });
};
