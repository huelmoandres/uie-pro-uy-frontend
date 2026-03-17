/**
 * Design tokens para uso en componentes.
 * - default export: tema light/dark (Themed, TabLayout, EditScreenInfo)
 * - COLORS: tokens para Lucide icons, StyleSheet (evita hardcodear hex)
 * Los valores coinciden con tailwind.config.js.
 */

export const COLORS = {
  accent: "#B89146",
  accentLight: "#D4B781",
  accentDark: "#8C6D2E",
  primary: "#0B1120",
  primaryLight: "#1E293B",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  slate: {
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
  },
  white: "#FFFFFF",
} as const;

const tintColorLight = COLORS.accent;
const tintColorDark = COLORS.accentLight;

export default {
  light: {
    text: "#11181C",
    background: "#F8FAFC",
    tint: tintColorLight,
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#0B1120",
    tint: tintColorDark,
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintColorDark,
  },
};
