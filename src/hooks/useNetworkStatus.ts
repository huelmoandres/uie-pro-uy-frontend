import { useEffect, useRef, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

const DEBOUNCE_MS = 1500;

interface NetworkStatus {
  /** true si hay conexión activa (puede ser wifi, celular, etc.) */
  isOnline: boolean;
  /** true si acaba de recuperarse la conexión (útil para auto-retry) */
  justReconnected: boolean;
}

/**
 * Detecta el estado de conectividad de red en tiempo real.
 * Usa debounce para evitar parpadeos: NetInfo.isInternetReachable puede
 * devolver false brevemente (timeouts, latencia) y provocar flicker.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const prevOnline = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRaw = useRef<boolean | null>(null);

  useEffect(() => {
    const applyState = (connected: boolean) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      pendingRaw.current = null;

      if (!prevOnline.current && connected) {
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 100);
      }
      prevOnline.current = connected;
      setIsOnline(connected);
    };

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected =
        state.isConnected === true && state.isInternetReachable !== false;

      if (pendingRaw.current === connected) return;
      pendingRaw.current = connected;

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        applyState(connected);
      }, DEBOUNCE_MS);
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      unsubscribe();
    };
  }, []);

  return { isOnline, justReconnected };
}
