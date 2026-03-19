import { useMutation } from "@tanstack/react-query";
import { updateProfile, deleteAccount } from "@api/auth.api";
import { useAuth } from "@context/AuthContext";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import type { UpdateProfileFormData } from "@schemas/auth.schema";

export const useUpdateProfile = () => {
  const { updateUserState } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileFormData) => updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUserState(updatedUser);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Perfil actualizado",
        text2: "Tus datos se guardaron correctamente.",
      });
    },
    onError: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar el perfil.",
      });
    },
  });
};

export const useDeleteAccount = () => {
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: async () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Cuenta eliminada",
        text2: "Tu cuenta y datos fueron eliminados correctamente.",
      });
      await signOut();
    },
    onError: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo eliminar la cuenta. Intentá nuevamente.",
      });
    },
  });
};
