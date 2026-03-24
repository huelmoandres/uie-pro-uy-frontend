import React from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Info } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface ProfileDataWarningModalProps {
  visible: boolean;
  onEntendido: () => void;
  onIrAConfiguracion: () => void;
}

/**
 * Modal informativo cuando el usuario intenta agendar sin tener cédula/teléfono.
 * No bloquea el proceso: "Entendido" continúa, "Ir a Configuración" navega a settings.
 */
export const ProfileDataWarningModal: React.FC<ProfileDataWarningModalProps> = ({
  visible,
  onEntendido,
  onIrAConfiguracion,
}) => {
  const handleEntendido = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEntendido();
  };

  const handleIrAConfiguracion = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIrAConfiguracion();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleEntendido}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={25}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleEntendido}>
          <View style={styles.backdropDim} />
        </Pressable>

        <View className="w-[88%] max-w-[360px] overflow-hidden rounded-[24px] bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-2xl">
          <View className="p-6">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-[16px] bg-accent/10">
              <Info size={24} color="#B89146" />
            </View>
            <Text className="text-lg font-sans-bold text-slate-900 dark:text-white">
              Completá tu perfil
            </Text>
            <Text className="mt-2 text-[14px] leading-5 text-slate-500 dark:text-slate-400">
              Para acelerar el proceso de agendar es mejor que vayas a Mi Perfil
              → Configuración y completes los datos de cédula y teléfono para
              automatizar mejor el proceso. Los datos no se van a autocompletar.
            </Text>
          </View>
          <View className="border-t border-slate-100 dark:border-white/5">
            <Pressable
              className="py-4 active:bg-slate-50 dark:active:bg-white/5"
              onPress={handleEntendido}
            >
              <Text className="text-center font-sans-bold text-sm text-accent">
                Entendido
              </Text>
            </Pressable>
            <View className="h-px bg-slate-100 dark:bg-white/5" />
            <Pressable
              className="py-4 active:bg-slate-50 dark:active:bg-white/5"
              onPress={handleIrAConfiguracion}
            >
              <Text className="text-center font-sans-bold text-sm text-accent">
                Ir a Configuración
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
