// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/types/**"],
  },
  {
    rules: {
      "react/display-name": "warn",
      "react/no-unescaped-entities": "warn",
      // Permite useEffect con [] intencional (solo al montar). Cambiar a "warn"
      // si se quiere visibilidad sin romper builds.
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      // require() dinámico necesario para lazy-load en Expo Go (evita crash).
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["src/hooks/useNotifications.ts"],
    rules: {
      // expo-notifications expone tipos parciales en listeners y AndroidImportance.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);
