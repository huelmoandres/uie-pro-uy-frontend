import { useEffect, useRef, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

interface NetworkStatus {
  /** true si hay conexión activa (puede ser wifi, celular, etc.) */
  isOnline: boolean;
  /** true si acaba de recuperarse la conexión (útil para auto-retry) */
  justReconnected: boolean;
}

/**
 * Detecta el estado de conectividad de red en tiempo real.
 * - `isOnline`: se actualiza inmediatamente al cambiar la conexión.
 * - `justReconnected`: true por un frame cuando vuelve la conexión,
 *    lo que permite disparar refetch/retry automáticos.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const prevOnline = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected =
        state.isConnected === true && state.isInternetReachable !== false;

      if (!prevOnline.current && connected) {
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 100);
      }

      prevOnline.current = connected;
      setIsOnline(connected);
    });

    return unsubscribe;
  }, []);

  return { isOnline, justReconnected };
}
