/**
 * Insets seguros: react-native-safe-area-context + RN SafeAreaView.
 * @see https://reactnative.dev/docs/safeareaview
 * @see https://appandflow.github.io/react-native-safe-area-context/
 */
export const MIN_TOUCH_BOTTOM = 12;

/**
 * Padding inferior estándar (home indicator / barra de navegación + aire).
 */
export function bottomInsetPadding(
  insetBottom: number,
  extra = 0,
  minBottom = MIN_TOUCH_BOTTOM,
): number {
  return Math.max(insetBottom, minBottom) + extra;
}

/**
 * Extra para el final de ScrollViews (contenido no tapado por tab bar).
 */
export function scrollContentBottomPadding(
  insetBottom: number,
  breathingRoom = 24,
): number {
  return bottomInsetPadding(insetBottom, breathingRoom);
}
