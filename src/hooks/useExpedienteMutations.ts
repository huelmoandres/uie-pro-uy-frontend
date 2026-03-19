import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpedienteService } from "@services";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

export const useUnfollowExpediente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (iue: string) => ExpedienteService.unfollow(iue),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ExpedienteService.queryKeys.lists(),
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Éxito",
        text2: "Dejaste de seguir este expediente.",
      });
      router.back();
    },
    onError: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo realizar la acción. Intentá de nuevo.",
      });
    },
  });
};
