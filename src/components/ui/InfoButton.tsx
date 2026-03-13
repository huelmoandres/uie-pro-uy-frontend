import React, { useState } from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Info } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface InfoButtonProps {
  title: string;
  description: string;
  size?: number;
}

/**
 * Botón de información que muestra un modal explicativo al presionar.
 * Útil para ayudar al usuario a entender secciones o conceptos.
 */
export const InfoButton: React.FC<InfoButtonProps> = ({
  title,
  description,
  size = 14,
}) => {
  const [visible, setVisible] = useState(false);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(true);
  };

  const handleClose = () => setVisible(false);

  return (
    <>
      <Pressable
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="h-6 w-6 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10"
      >
        <Info size={size} color="#94A3B8" />
      </Pressable>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <BlurView
            intensity={25}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
            <View style={styles.backdropDim} />
          </Pressable>

          <View className="w-[88%] max-w-[360px] overflow-hidden rounded-[24px] bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-white/5 shadow-2xl">
            <View className="p-6">
              <View className="mb-4 h-12 w-12 items-center justify-center rounded-[16px] bg-accent/10">
                <Info size={24} color="#B89146" />
              </View>
              <Text className="text-lg font-sans-bold text-slate-900 dark:text-white">
                {title}
              </Text>
              <Text className="mt-2 text-[14px] leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </Text>
            </View>
            <Pressable
              className="border-t border-slate-100 dark:border-white/5 py-4 active:bg-slate-50 dark:active:bg-white/5"
              onPress={handleClose}
            >
              <Text className="text-center font-sans-bold text-sm text-accent">
                Entendido
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
