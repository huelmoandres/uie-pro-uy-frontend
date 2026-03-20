import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { ReferralService, AuthService } from "@services";
import { useAuth } from "@context/AuthContext";
import { extractApiErrorCode } from "@utils/apiError";

export function useReferralCode() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...ReferralService.queryKeys.code(), user?.id],
    queryFn: ReferralService.getReferralCode,
    enabled: !!user?.id,
    staleTime: Infinity,
  });
}

export function useApplyReferralCode() {
  const queryClient = useQueryClient();
  const { user, updateUserState } = useAuth();

  return useMutation({
    mutationFn: (code: string) => ReferralService.applyReferralCode(code),
    onSuccess: async () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "¡Código aplicado!",
        text2: "Tu código de invitación fue registrado correctamente.",
      });

      // Refrescar el usuario en AuthContext para que referralType y referredById
      // se actualicen inmediatamente en la UI sin necesidad de logout/login.
      try {
        const refreshedUser = await AuthService.getCurrentUser();
        updateUserState(refreshedUser);
      } catch {
        // Si falla el refresh, igual se mostró el toast de éxito.
        // El estado se actualizará en la próxima sesión.
        void queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
      }
    },
    onError: (err: Error) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const code = extractApiErrorCode(err);
      let message = "No se pudo aplicar el código. Intentá de nuevo.";
      if (code === "REF_001") message = "Código de referido no encontrado.";
      if (code === "REF_002") message = "No podés usar tu propio código.";
      if (code === "REF_003") message = "Ya tenés un código de invitación aplicado.";
      Toast.show({ type: "error", text1: "Error", text2: message });
    },
  });
}
