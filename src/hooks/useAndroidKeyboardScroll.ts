import { useEffect } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Android: con `softwareKeyboardLayoutMode: resize` y modales, el foco en un
 * TextInput no siempre desplaza la lista/scroll. Este hook vuelve a ejecutar
 * `scroll` justo después de `keyboardDidShow` (y un reintento corto) para
 * acercar el campo visible encima del teclado.
 */
export function useAndroidKeyboardScroll(
  scroll: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled || Platform.OS !== "android") return;
    const sub = Keyboard.addListener("keyboardDidShow", () => {
      requestAnimationFrame(() => {
        scroll();
        setTimeout(scroll, 160);
        setTimeout(scroll, 320);
      });
    });
    return () => sub.remove();
  }, [scroll, enabled]);
}
