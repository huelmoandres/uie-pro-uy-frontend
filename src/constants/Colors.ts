/**
 * Premium Color Palette Constants
 * Matches tailwind.config.js for deep integration.
 */

const tintColorLight = "#0B1120"; // Primary Navy
const tintColorDark = "#B89146"; // Accent Gold

export default {
  light: {
    text: "#0F172A",
    background: "#F8FAFC",
    tint: tintColorLight,
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F8FAFC",
    background: "#0B1120",
    tint: tintColorDark,
    tabIconDefault: "#475569",
    tabIconSelected: tintColorDark,
  },
};
