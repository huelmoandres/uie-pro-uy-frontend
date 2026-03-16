import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TOOLTIP_KEYS } from "@/constants/onboarding";

type TooltipKey = (typeof TOOLTIP_KEYS)[keyof typeof TOOLTIP_KEYS];

/**
 * Hook para tooltips que se muestran una sola vez por usuario.
 * Usa AsyncStorage para persistir el estado "visto".
 */
export function useTooltipSeen(key: TooltipKey) {
  const [hasSeen, setHasSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(key).then((value) => {
      setHasSeen(value === "true");
    });
  }, [key]);

  const markSeen = useCallback(async () => {
    await AsyncStorage.setItem(key, "true");
    setHasSeen(true);
  }, [key]);

  return {
    hasSeen: hasSeen === true,
    isLoading: hasSeen === null,
    shouldShow: hasSeen === false,
    markSeen,
  };
}
