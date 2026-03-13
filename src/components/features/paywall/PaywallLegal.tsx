import React from "react";
import { View, Text, Pressable, Linking, Platform } from "react-native";
import {
  SUBSCRIPTION_DISPLAY_NAME,
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_TRIAL_DAYS,
} from "@/constants/revenuecat";
import { LEGAL_URLS } from "@/constants/legal";

/**
 * Bloque legal requerido por Apple Guideline 3.1.2(c).
 * Debe incluir: título, duración, precio y links funcionales a Privacy y Terms (EULA).
 */
export function PaywallLegal() {
  const openUrl = (url: string) => {
    void Linking.openURL(url);
  };

  const isIOS = Platform.OS === "ios";

  return (
    <View className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
      {/* Info de suscripción (requerido por Apple) */}
      <View className="mb-4">
        <Text className="text-[11px] font-sans-semi text-slate-600 dark:text-slate-400 mb-1">
          {SUBSCRIPTION_DISPLAY_NAME}
        </Text>
        <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-500">
          {SUBSCRIPTION_PRICE} por mes · {SUBSCRIPTION_TRIAL_DAYS} días de
          prueba gratis
        </Text>
      </View>

      {/* Texto de aceptación */}
      <Text className="text-[11px] font-sans text-slate-500 dark:text-slate-500 text-center mb-4">
        {isIOS
          ? "Al suscribirte, aceptás nuestra Política de Privacidad, Términos de Uso y el EULA de Apple."
          : "Al suscribirte, aceptás nuestra Política de Privacidad y Términos de Uso."}
      </Text>

      {/* Links funcionales — obligatorios */}
      <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-3">
        <Pressable
          onPress={() => openUrl(LEGAL_URLS.PRIVACY_POLICY)}
          accessibilityRole="link"
          accessibilityLabel="Política de Privacidad"
        >
          <Text className="text-[12px] font-sans-semi text-accent underline">
            Política de Privacidad
          </Text>
        </Pressable>
        <Pressable
          onPress={() => openUrl(LEGAL_URLS.TERMS_OF_USE)}
          accessibilityRole="link"
          accessibilityLabel="Términos de Uso"
        >
          <Text className="text-[12px] font-sans-semi text-accent underline">
            Términos de Uso (EULA)
          </Text>
        </Pressable>
        {isIOS && (
          <Pressable
            onPress={() => openUrl(LEGAL_URLS.APPLE_EULA)}
            accessibilityRole="link"
            accessibilityLabel="EULA de Apple"
          >
            <Text className="text-[12px] font-sans-semi text-accent underline">
              EULA de Apple
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
