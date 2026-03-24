import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import type * as NotificationsType from "expo-notifications";
import { router } from "expo-router";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { AppState, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { apiClient, SECURE_STORE_KEYS } from "../api/client";
import { navigateToExpedienteFromNotification } from "@utils/navigation";

// Detect if we are running in Expo Go (where notifications are restricted in SDK 53+)
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Lazy-load expo-notifications only if NOT in Expo Go to prevent crashes during module evaluation.
 */
const getNotificationsModule = () => {
  if (isExpoGo) return null;
  try {
    return require("expo-notifications");
  } catch (e) {
    console.error("[Notifications] Failed to load module:", e);
    return null;
  }
};

const Notifications = getNotificationsModule();

// Configure how notifications appear when the app is in foreground
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export type RegisterNotificationsResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Clears the cached push token from SecureStore so the next call to
 * requestAndRegisterNotifications forces a fresh API registration.
 */
export async function clearCachedPushToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.PUSH_TOKEN);
}

/**
 * Requests push notification permissions and registers the device token.
 * Called from NotificationPermissionModal after the user taps "Activar".
 */
export async function requestAndRegisterNotifications(): Promise<RegisterNotificationsResult> {
  if (isExpoGo) {
    return {
      ok: false,
      reason:
        "Las notificaciones no funcionan en Expo Go. Usá un development build.",
    };
  }
  if (!Notifications || !Device.isDevice) {
    return { ok: false, reason: "No se detectó un dispositivo físico." };
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("expedientes", {
      name: "Expedientes Judiciales",
      importance: (Notifications as any).AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1E3A5F",
    });
  }
  // Primero leer estado actual (getPermissionsAsync); si undetermined, pedir (requestPermissionsAsync).
  // Así evitamos que requestPermissionsAsync devuelva "denied" cacheado cuando el usuario ya habilitó en Settings.
  let { status } = await Notifications.getPermissionsAsync();
  if (status === "undetermined") {
    const { status: requested } = await Notifications.requestPermissionsAsync();
    status = requested;
  }
  if (status !== "granted") {
    return {
      ok: false,
      reason:
        "Permisos denegados. Activá las notificaciones en Configuración del dispositivo y volvé a la app.",
    };
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return {
      ok: false,
      reason: "Configuración de la app incompleta (projectId).",
    };
  }
  const accessToken = await SecureStore.getItemAsync(
    SECURE_STORE_KEYS.ACCESS_TOKEN,
  );
  if (!accessToken) {
    return {
      ok: false,
      reason: "Sesión expirada. Volvé a iniciar sesión.",
    };
  }
  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });

    // Evitar llamadas redundantes: solo registrar si el token cambió desde el último envío.
    const cachedToken = await SecureStore.getItemAsync(
      SECURE_STORE_KEYS.PUSH_TOKEN,
    );
    if (cachedToken === token.data) {
      return { ok: true };
    }

    await apiClient.post("/users/me/push-token", { token: token.data });
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.PUSH_TOKEN, token.data);
    return { ok: true };
  } catch (error) {
    console.error("[Notifications] Failed to register token:", error);
    const msg =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { status?: number } }).response?.status === 401
          ? "Sesión expirada. Volvé a iniciar sesión."
          : "Error de conexión. Verificá tu internet e intentá de nuevo."
        : "Error al conectar con el servidor. Intentá de nuevo.";
    return { ok: false, reason: msg };
  }
}

/**
 * Hook for notification registration, foreground display, and tap navigation.
 * Handles both foreground taps and cold-start taps (app was closed).
 * Solo registra el push token cuando el usuario está autenticado (evita 401).
 */
export function useNotifications(isAuthenticated: boolean = false) {
  const notificationListener =
    useRef<NotificationsType.EventSubscription | null>(null);
  const responseListener = useRef<NotificationsType.EventSubscription | null>(
    null,
  );

  useEffect(() => {
    if (isExpoGo || !Notifications) {
      console.warn(
        "[Notifications] Remote notifications are not supported in Expo Go. Use a development build.",
      );
      return;
    }

    if (isAuthenticated) {
      void registerForPushNotifications();
    }

    // ── Foreground notification received ──────────────────────────
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification: any) => {
        console.log(
          "[Notifications] Received:",
          notification.request.identifier,
        );
      });

    // ── User tapped a notification (app was open or backgrounded) ─
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        handleNotificationResponse(response);
      });

    // ── Cold start: app was fully closed when notification was tapped ─
    void Notifications.getLastNotificationResponseAsync().then(
      (response: any) => {
        if (response) {
          // Small delay to ensure the navigator is ready
          setTimeout(() => handleNotificationResponse(response), 300);
        }
      },
    );

    const appStateSub = isAuthenticated
      ? AppState.addEventListener("change", (nextState) => {
          if (nextState === "active") {
            void registerForPushNotifications();
          }
        })
      : null;

    return () => {
      appStateSub?.remove();
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);

  async function registerForPushNotifications() {
    if (!Device.isDevice || !Notifications) return;
    const { status } = await Notifications.getPermissionsAsync();
    // Only silently register if already granted (pre-prompt handled by NotificationPermissionModal)
    if (status === "granted") {
      await requestAndRegisterNotifications();
    }
  }
}

function handleNotificationResponse(response: any) {
  const data = response?.notification?.request?.content?.data as
    | Record<string, unknown>
    | undefined;
  if (!data) return;

  const type = data.type as string | undefined;
  const params = data.params as Record<string, unknown> | undefined;
  const iue =
    (data.expedienteId as string | undefined) ??
    (data.iue as string | undefined) ??
    (params?.iue as string | undefined);

  // Type takes priority — DEADLINE_ALERT also carries expedienteId but should go to agenda.
  if (type === "DEADLINE_ALERT") {
    router.push("/(tabs)/deadline-agenda" as any);
    return;
  }

  if (type === "EXPEDIENTE_UPDATE") {
    const grouped = data.grouped as boolean | undefined;
    const route = data.route as string | undefined;
    const scope =
      typeof params?.scope === "string" ? (params.scope as string) : undefined;
    const iuesPayload = data.iues as string[] | string | undefined;
    const iues = Array.isArray(iuesPayload)
      ? iuesPayload
      : typeof iuesPayload === "string"
        ? iuesPayload
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    if (
      grouped &&
      route === "/expedientes/updates" &&
      scope === "todayMovements"
    ) {
      router.push({
        pathname: "/expedientes/updates",
        params: { scope: "todayMovements" },
      } as any);
      return;
    }

    // Retrocompatibilidad con payload anterior (iues)
    if (grouped && route === "/expedientes/updates" && iues.length > 0) {
      router.push({
        pathname: "/expedientes/updates",
        params: { iues: iues.join(",") },
      } as any);
      return;
    }
    if (iue) {
      navigateToExpedienteFromNotification(iue);
    }
    return;
  }

  // REMINDER y otros: si tienen IUE (expedienteId, iue o params.iue), ir al detalle
  if (iue) {
    navigateToExpedienteFromNotification(iue);
  }
}
