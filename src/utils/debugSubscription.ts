/**
 * Debug utilities para reproducir el escenario "trial cancelado con acceso".
 * Solo activo en __DEV__. Usar para reproducir el error "cannot read property stale".
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEBUG_KEY = "@iue_pro/debug_simulate_cancelled_trial";

export async function isSimulateCancelledTrialEnabled(): Promise<boolean> {
  if (!__DEV__) return false;
  try {
    const v = await AsyncStorage.getItem(DEBUG_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function setSimulateCancelledTrial(
  enabled: boolean,
): Promise<void> {
  if (!__DEV__) return;
  try {
    if (enabled) {
      await AsyncStorage.setItem(DEBUG_KEY, "1");
    } else {
      await AsyncStorage.removeItem(DEBUG_KEY);
    }
  } catch (e) {
    console.warn("[Debug] Failed to set simulate cancelled trial:", e);
  }
}
