import { Platform } from "react-native";
import type { KeyboardAvoidingViewProps } from "react-native";

/**
 * Props comunes para KeyboardAvoidingView.
 * Centraliza behavior y keyboardVerticalOffset para facilitar ajustes futuros.
 *
 * - iOS: 'padding' suele funcionar mejor; offset 0 para pantallas sin header (auth).
 * - Android: 'height'; offset 20 para ajuste fino.
 */
export const KEYBOARD_AVOIDING_VIEW_PROPS: KeyboardAvoidingViewProps = {
  behavior: Platform.OS === "ios" ? "padding" : "height",
  keyboardVerticalOffset: Platform.OS === "ios" ? 0 : 20,
};
