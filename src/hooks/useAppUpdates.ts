import { useState, useCallback, useEffect } from "react";
import * as Updates from "expo-updates";

interface UseAppUpdatesResult {
  isChecking: boolean;
  isDownloading: boolean;
  error: Error | null;
  checkForUpdates: () => Promise<void>;
}

export function useAppUpdates(): UseAppUpdatesResult {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasCheckedInit, setHasCheckedInit] = useState(false);

  const checkForUpdates = useCallback(async () => {
    try {
      if (__DEV__) {
        // En modo desarrollo, expo-updates no funciona de la misma manera
        // Se omite la comprobación para no interrumpir el flujo.
        return;
      }

      setIsChecking(true);
      setError(null);

      const updateInfo = await Updates.checkForUpdateAsync();

      if (updateInfo.isAvailable) {
        setIsDownloading(true);
        // Descargar la actualización en segundo plano
        await Updates.fetchUpdateAsync();

        // Reiniciar la app para aplicar la nueva versión
        await Updates.reloadAsync();
      }
    } catch (err) {
      console.warn("Error checking for OTA updates:", err);
      // Fail-safe: Si algo falla (no internet, timeout de Expo), capturamos el error
      // y permitimos que la app continúe su flujo normal.
      setError(err instanceof Error ? err : new Error("Unknown update error"));
    } finally {
      setIsChecking(false);
      setIsDownloading(false);
    }
  }, []);

  // Check automatically on cold start (hook mount)
  useEffect(() => {
    if (!hasCheckedInit) {
      setHasCheckedInit(true);
      void checkForUpdates();
    }
  }, [checkForUpdates, hasCheckedInit]);

  return { isChecking, isDownloading, error, checkForUpdates };
}
