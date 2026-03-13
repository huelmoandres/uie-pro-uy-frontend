import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@services";
import { useAuth } from "@context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { SECURE_STORE_KEYS } from "@api/client";
import type { ILoginRequest, IRegisterRequest } from "@app-types/auth.types";
import { requestAndRegisterNotifications } from "@hooks/useNotifications";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { updateUserState } = useAuth();

  return useMutation({
    mutationFn: async (data: ILoginRequest) => {
      const result = await AuthService.login(data);
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
      return result;
    },
    onSuccess: async () => {
      const user = await AuthService.getCurrentUser();
      updateUserState(
        user,
        await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
      );
      queryClient.setQueryData(["currentUser"], user);

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
