import React from "react";
import { View, Text, Pressable, Linking, Platform } from "react-native";

const LEGAL_BASE_URL = "https://iueprouy.com";
const PRIVACY_URL = `${LEGAL_BASE_URL}/privacy-policy.html`;
const TERMS_URL = `${LEGAL_BASE_URL}/terms.html`;

/** EULA estándar de Apple — requerido por Guideline 3.1.2(c) solo en iOS */
const APPLE_EULA_URL =
  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

export function PaywallLegal() {
  const openUrl = (url: string) => {
    void Linking.openURL(url);
  };

  const isIOS = Platform.OS === "ios";

  return (
    <View className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
      <Text className="text-[11px] font-sans text-slate-400 dark:text-slate-500 text-center mb-3">
        {isIOS
          ? "Al suscribirte, aceptás nuestra Política de Privacidad, Términos de Uso y el Contrato de licencia de usuario final (EULA) de Apple."
          : "Al suscribirte, aceptás nuestra Política de Privacidad y Términos de Uso."}
      </Text>
      <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-2">
        <Pressable onPress={() => openUrl(PRIVACY_URL)}>
          <Text className="text-[12px] font-sans-semi text-accent">
            Política de Privacidad
          </Text>
        </Pressable>
        <Pressable onPress={() => openUrl(TERMS_URL)}>
          <Text className="text-[12px] font-sans-semi text-accent">
            Términos de Uso
          </Text>
        </Pressable>
        {isIOS && (
          <Pressable onPress={() => openUrl(APPLE_EULA_URL)}>
            <Text className="text-[12px] font-sans-semi text-accent">
              EULA (Apple)
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
