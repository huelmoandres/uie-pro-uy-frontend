import React from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { Lock, X } from "lucide-react-native";
import { router } from "expo-router";
import { FEATURE_PARAM_TO_LABEL } from "@constants/premiumFeatures";

interface PremiumGateModalProps {
  visible: boolean;
  onClose: () => void;
  /** Clave del param ?feature= para contexto en Paywall (ej: "agenda", "compare"). */
  feature: string;
}

/**
 * Modal que se muestra cuando un usuario free intenta acceder a una feature premium.
 * El botón "Ver Planes" navega a /paywall?feature=X para texto dinámico en el Paywall
 * (mejora conversión ~15-20%).
 */
export function PremiumGateModal({
  visible,
  onClose,
  feature,
}: PremiumGateModalProps) {
  const featureName = FEATURE_PARAM_TO_LABEL[feature] ?? "esta función";

  const handleGoToPaywall = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push(`/paywall?feature=${encodeURIComponent(feature)}` as any);
  };

  React.useEffect(() => {
    if (visible) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={styles.backdropDim} />
        </Pressable>

        <View className="w-[88%] max-w-[360px] overflow-hidden rounded-[32px] bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-white/5 shadow-2xl">
          <View className="p-8 items-center">
            <View className="mb-6 h-16 w-16 items-center justify-center rounded-[22px] bg-accent/10">
              <Lock size={32} color="#C5A059" />
            </View>

            <Text className="text-center text-xl font-sans-bold text-slate-900 dark:text-white">
              Función Premium
            </Text>

            <Text className="mt-3 text-center text-[14px] leading-5 text-slate-500 dark:text-slate-400 px-1">
              Para usar {featureName} necesitás IUE Pro. ¿Querés ver los planes?
            </Text>
          </View>

          <View className="flex-row border-t border-slate-100 dark:border-white/5">
            <Pressable
              className="flex-1 items-center justify-center py-5 active:bg-slate-50 dark:active:bg-white/5"
              onPress={onClose}
            >
              <Text className="font-sans-semi text-sm text-slate-400 uppercase tracking-wider">
                Ahora no
              </Text>
            </Pressable>

            <View className="w-[1px] bg-slate-100 dark:bg-white/5" />

            <Pressable
              className="flex-1 items-center justify-center py-5 bg-accent/10 active:opacity-90"
              onPress={handleGoToPaywall}
            >
              <Text className="font-sans-bold text-sm uppercase tracking-wider text-accent">
                Ver Planes
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onClose}
            className="absolute right-4 top-4 h-8 w-8 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10"
          >
            <X size={16} color="#94A3B8" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backdropDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
});
