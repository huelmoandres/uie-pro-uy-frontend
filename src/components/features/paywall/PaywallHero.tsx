import React from "react";
import { View, Text } from "react-native";
import { FileText } from "lucide-react-native";
import { getPaywallHeroSubtitle } from "@constants/premiumFeatures";

const DEFAULT_SUBTITLE =
  "Desbloqueá todas las funcionalidades para gestionar tus expedientes judiciales.";

interface PaywallHeroProps {
  /** Param ?feature= para texto dinámico (mejora conversión). */
  featureParam?: string | string[];
}

export function PaywallHero({ featureParam }: PaywallHeroProps = {}) {
  const dynamicSubtitle = getPaywallHeroSubtitle(featureParam);
  const subtitle = dynamicSubtitle || DEFAULT_SUBTITLE;

  return (
    <View className="items-center mb-8">
      <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-accent/15 mb-4">
        <FileText size={32} color="#B89146" />
      </View>
      <Text className="text-2xl font-sans-bold text-slate-900 dark:text-white text-center">
        IUE.uy Pro
      </Text>
      <Text className="mt-2 text-sm font-sans text-slate-500 dark:text-slate-400 text-center px-6">
        {subtitle}
      </Text>
    </View>
  );
}
