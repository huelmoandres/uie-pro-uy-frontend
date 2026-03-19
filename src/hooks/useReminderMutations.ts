import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { ReminderService } from "@services";
import type { ICreateReminderPayload } from "@app-types/reminder.types";
import { useAnalytics } from "@hooks/useAnalytics";

/**
 * Mutación para crear un recordatorio relativo a un plazo.
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();
  const { trackEvent } = useAnalytics();

  return useMutation({
    mutationFn: (payload: ICreateReminderPayload) =>
      ReminderService.create(payload),
    onSuccess: () => {
      trackEvent("reminder_created");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Recordatorio creado",
        text2: "Recibirás una notificación push en la fecha programada.",
      });
      void queryClient.invalidateQueries({ queryKey: ReminderService.queryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["deadline-agenda"] });
    },
    onError: (err: Error) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "No se pudo crear el recordatorio",
        text2: err.message ?? "Intentá de nuevo más tarde.",
      });
    },
  });
}

/**
 * Mutación para eliminar un recordatorio.
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ReminderService.remove(id),
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Recordatorio eliminado" });
      void queryClient.invalidateQueries({ queryKey: ReminderService.queryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["deadline-agenda"] });
    },
    onError: (err: Error) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "No se pudo eliminar",
        text2: err.message ?? "Intentá de nuevo.",
      });
    },
  });
}
