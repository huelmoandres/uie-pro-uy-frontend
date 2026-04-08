import { Keyboard } from "react-native";
import type { KeyboardAvoidingViewProps } from "react-native";

/** Cierra el IME (útil antes de cerrar modales o al tocar fuera en Android). */
export function dismissKeyboard(): void {
  Keyboard.dismiss();
}

/**
 * Props estáticas para KeyboardAvoidingView (pantallas sin hook).
 *
 * Preferí `useKeyboardAvoidingViewProps('screen' | 'modal')`: en Android modales, offset + fondo
 * en `modalKeyboardSheetLayer` (ver `modalStyles.ts`).
 *
 * @see https://reactnative.dev/docs/keyboardavoidingview
 */
export const KEYBOARD_AVOIDING_VIEW_PROPS: KeyboardAvoidingViewProps = {
  behavior: "padding",
  keyboardVerticalOffset: 0,
};
