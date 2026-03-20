import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { SECURE_STORE_KEYS } from "@api/client";

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos en background

export interface UseBiometricReturn {
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  isLocked: boolean;
  biometricType: "faceid" | "fingerprint" | "iris" | null;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticate: () => Promise<boolean>;
  unlock: () => void;
}

export function useBiometric(isAuthenticated: boolean): UseBiometricReturn {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricType, setBiometricType] = useState<"faceid" | "fingerprint" | "iris" | null>(null);

  const backgroundedAt = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    void checkAvailability();
    void loadPreference();
  }, []);

  async function checkAvailability() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(hasHardware && isEnrolled);

    if (hasHardware && isEnrolled) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("faceid");
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("fingerprint");
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType("iris");
      }
    }
  }

  async function loadPreference() {
    const value = await SecureStore.getItemAsync(SECURE_STORE_KEYS.BIOMETRIC_ENABLED);
    setIsBiometricEnabled(value === "true");
  }

  const handleAppStateChange = useCallback((nextState: AppStateStatus) => {
    if (appState.current === "active" && nextState === "background") {
      backgroundedAt.current = Date.now();
    }

    if (
      appState.current === "background" &&
      nextState === "active" &&
      isBiometricEnabled &&
      backgroundedAt.current !== null &&
      Date.now() - backgroundedAt.current >= LOCK_TIMEOUT_MS
    ) {
      setIsLocked(true);
    }

    appState.current = nextState;
  }, [isBiometricEnabled]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLocked(false);
      return;
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated, isBiometricEnabled, handleAppStateChange]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloqueá IUE Pro",
      fallbackLabel: "Usar contraseña",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
    });
    return result.success;
  }, []);

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    const ok = await authenticate();
    if (ok) {
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.BIOMETRIC_ENABLED, "true");
      setIsBiometricEnabled(true);
    }
    return ok;
  }, [authenticate]);

  const disableBiometric = useCallback(async (): Promise<void> => {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.BIOMETRIC_ENABLED);
    setIsBiometricEnabled(false);
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    isLocked,
    biometricType,
    enableBiometric,
    disableBiometric,
    authenticate,
    unlock,
  };
}
