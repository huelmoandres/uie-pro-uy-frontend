import * as Application from "expo-application";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "app_device_id";

/**
 * Genera un identificador estable del dispositivo para limitar sesiones.
 * Usa SecureStore + UUID como fallback si el ID nativo falla (evita Date.now() que crearía sesiones falsas).
 */
export async function getDeviceId(): Promise<string> {
  let hwId: string | null = null;
  if (Platform.OS === "ios") {
    hwId = await Application.getIosIdForVendorAsync();
  }
  if (Platform.OS === "android") {
    hwId = Application.getAndroidId();
  }

  if (hwId) return `${Platform.OS}-${hwId}`;

  let storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!storedId) {
    storedId = `fallback-${Platform.OS}-${uuidv4()}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, storedId);
  }
  return storedId;
}

export async function getDeviceName(): Promise<string> {
  return `${Device.brand ?? ""} ${Device.modelName ?? "Unknown"}`.trim();
}
