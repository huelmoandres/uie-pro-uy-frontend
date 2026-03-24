import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { RotateCcw, Check } from "lucide-react-native";
import { router } from "expo-router";
import {
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_TRIAL_DAYS,
} from "@/constants/revenuecat";

interface PaywallCtaProps {
  onSubscribe: () => void;
  onRestore: () => void;
  isPurchasing: boolean;
  isRestoring: boolean;
  isPro?: boolean;
}

export function PaywallCta({
  onSubscribe,
  onRestore,
  isPurchasing,
  isRestoring,
  isPro = false,
}: PaywallCtaProps) {
  const isBusy = isPurchasing || isRestoring;

  if (isPro) {
    return (
      <View className="mt-10">
        <Pressable
          className="flex-row items-center justify-center gap-2.5 rounded-2xl bg-accent py-5 shadow-lg shadow-accent/25 active:scale-[0.98]"
          onPress={() =>
            router.replace("/(tabs)" as import("expo-router").Href)
          }
        >
          <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text className="text-sm font-sans-bold uppercase tracking-[2px] text-white">
            Suscripción activa — Ir al inicio
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mt-10">
      <View className="mb-4 items-center">
        <Text className="text-[16px] font-sans-bold text-slate-900 dark:text-white">
          {SUBSCRIPTION_PRICE} / mes
        </Text>
        <Text className="mt-1 text-[12px] font-sans text-slate-500 dark:text-slate-400">
          {SUBSCRIPTION_TRIAL_DAYS} días de prueba gratis, sin permanencia.
        </Text>
      </View>
      <Pressable
        className="items-center justify-center rounded-2xl bg-accent py-5 shadow-lg shadow-accent/25 active:scale-[0.98] disabled:opacity-60"
        onPress={onSubscribe}
        disabled={isBusy}
      >
        {isPurchasing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="text-sm font-sans-bold uppercase tracking-[2px] text-white">
            Comenzar prueba gratuita
          </Text>
        )}
      </Pressable>

      <Pressable
        className="mt-5 flex-row items-center justify-center gap-2 py-3 active:opacity-70 disabled:opacity-50"
        onPress={onRestore}
        disabled={isBusy}
      >
        {isRestoring ? (
          <ActivityIndicator size="small" color="#64748B" />
        ) : (
          <RotateCcw size={16} color="#64748B" />
        )}
        <Text className="text-[13px] font-sans-semi text-slate-500 dark:text-slate-400">
          Restaurar Compras
        </Text>
      </Pressable>
    </View>
  );
}
