import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ColorSchemeValue = "light" | "dark" | "system";

const STORAGE_KEY = "@app_color_scheme";

/**
 * Wraps NativeWind's useColorScheme adding AsyncStorage persistence.
 * Use this hook in settings to read and set the scheme.
 */
export function useAppColorScheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const setPersistedColorScheme = async (scheme: ColorSchemeValue) => {
    setColorScheme(scheme);
    await AsyncStorage.setItem(STORAGE_KEY, scheme);
  };

  return { colorScheme, setColorScheme: setPersistedColorScheme };
}

/**
 * Reads the persisted color scheme from AsyncStorage and applies it once.
 * Returns true when the restore is complete — used in _layout.tsx to gate
 * SplashScreen.hideAsync() and prevent a flash of the wrong theme.
 */
export function useRestoreColorScheme(): boolean {
  const { setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          setColorScheme(saved as ColorSchemeValue);
        }
      })
      .finally(() => {
        setIsReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isReady;
}
