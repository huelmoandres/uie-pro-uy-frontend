import { useEffect } from "react";
import { Keyboard } from "react-native";

/**
 * Hook para modales con inputs: descarta el teclado al cerrar el modal.
 * Evita que al reabrir el modal el teclado quede abierto o el input enfocado.
 *
 * @param visible - Si el modal está visible
 * @param onDismiss - Callback opcional al cerrar (ej: resetForm). Se ejecuta cuando visible pasa a false.
 *
 * @example
 * // Modal simple
 * useModalKeyboardDismiss(visible);
 *
 * @example
 * // Modal con reset de form
 * useModalKeyboardDismiss(visible, resetForm);
 */
export function useModalKeyboardDismiss(
  visible: boolean,
  onDismiss?: () => void,
): void {
  useEffect(() => {
    if (!visible) {
      Keyboard.dismiss();
      onDismiss?.();
    }
  }, [visible, onDismiss]);
}
