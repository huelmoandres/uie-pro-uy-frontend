import { StyleSheet } from "react-native";

/**
 * Estilos compartidos para modales bottom-sheet.
 * Evita duplicación de overlay/backdrop en CreateReminderModal, SedesFilterModal, etc.
 */
export const modalBottomSheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
