import { Platform, StyleSheet, type ViewStyle } from "react-native";

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

/**
 * Capas para modales con teclado en Android: el backdrop queda zIndex 0; el contenedor
 * del sheet con `pointerEvents: "box-none"` deja pasar toques solo al backdrop en zona
 * vacía, mientras el sheet con `pointerEvents: "auto"` captura toques en inputs/botones.
 */
export const modalKeyboardSheetLayer: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  zIndex: 1,
  justifyContent: "flex-end",
  // Android: el padding del KAV dejaba zona sin pintar (negro del window) entre teclado y sheet.
  // Mismo tono que el backdrop para que el hueco sea coherente con el overlay.
  ...(Platform.OS === "android"
    ? { backgroundColor: "rgba(0,0,0,0.5)" }
    : {}),
};
