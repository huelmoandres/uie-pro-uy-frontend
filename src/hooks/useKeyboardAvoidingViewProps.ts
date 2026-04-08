import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { KeyboardAvoidingViewProps } from "react-native";
import { bottomInsetPadding } from "@utils/safeAreaLayout";

export type KeyboardAvoidingLayoutContext = "screen" | "modal";

/**
 * Props para KeyboardAvoidingView alineadas al dispositivo.
 *
 * - iOS: `keyboardVerticalOffset` en 0.
 * - Android (pantallas): `keyboardVerticalOffset` 0.
 * - Android (modales): `keyboardVerticalOffset` ≈ safe area top — con `statusBarTranslucent` RN
 *   suele medir mal el origen Y; además el sheet debe subir con el IME (`enabled: true`).
 *   El hueco entre teclado y sheet se mitiga con `modalKeyboardSheetLayer` (fondo semitransparente).
 *
 * @see https://reactnative.dev/docs/keyboardavoidingview#keyboardverticaloffset
 */
export function useKeyboardAvoidingViewProps(
  context: KeyboardAvoidingLayoutContext = "screen",
): KeyboardAvoidingViewProps {
  const { top } = useSafeAreaInsets();

  if (Platform.OS === "ios") {
    return { behavior: "padding", keyboardVerticalOffset: 0 };
  }

  const keyboardVerticalOffset =
    context === "modal" ? Math.max(0, Math.round(top)) : 0;

  return {
    behavior: "padding",
    keyboardVerticalOffset,
  };
}

/**
 * Padding inferior para hojas / modales bottom-sheet (safe area + extra).
 */
export function useSheetBottomPadding(extra = 16): number {
  const { bottom } = useSafeAreaInsets();
  return bottomInsetPadding(bottom, extra);
}
