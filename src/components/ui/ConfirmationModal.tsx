import React from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet
} from "react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { AlertTriangle, Info, X } from "lucide-react-native";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Premium Confirmation Modal
 * Uses Judicial Connector Navy & Gold palette.
 * Fixed layout issues using robust styles.
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "primary",
  onConfirm,
  onCancel,
}) => {
  // Feedback haptics
  React.useEffect(() => {
    if (visible) {
      if (type === "danger") {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [visible, type]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {/* Backdrop Blur */}
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel}>
          <View style={styles.backdropDim} />
        </Pressable>

        {/* Modal Container */}
        <View className="w-[88%] max-w-[360px] overflow-hidden rounded-[32px] bg-white dark:bg-[#0B1120] border border-slate-100 dark:border-white/5 shadow-2xl">
          <View className="p-8 items-center">
            {/* Status Icon Wrapper */}
            <View
              className={`mb-6 h-16 w-16 items-center justify-center rounded-[22px] ${type === "danger" ? "bg-danger/10" : "bg-accent/10"}`}
            >
              {type === "danger" ? (
                <AlertTriangle size={32} color="#EF4444" />
              ) : (
                <Info size={32} color="#C5A059" />
              )}
            </View>

            <Text className="text-center text-xl font-sans-bold text-slate-900 dark:text-white">
              {title}
            </Text>

            <Text className="mt-3 text-center text-[14px] leading-5 text-slate-500 dark:text-slate-400 px-1">
              {description}
            </Text>
          </View>

          {/* Footer Actions */}
          <View className="flex-row border-t border-slate-100 dark:border-white/5">
            <Pressable
              className="flex-1 items-center justify-center py-5 active:bg-slate-50 dark:active:bg-white/5"
              onPress={onCancel}
            >
              <Text className="font-sans-semi text-sm text-slate-400 uppercase tracking-wider">
                {cancelText}
              </Text>
            </Pressable>

            <View className="w-[1px] bg-slate-100 dark:bg-white/5" />

            <Pressable
              className={`flex-1 items-center justify-center py-5 active:opacity-90 ${type === "danger" ? "bg-danger/5" : "bg-accent/5"}`}
              onPress={onConfirm}
            >
              <Text
                className={`font-sans-bold text-sm uppercase tracking-wider ${type === "danger" ? "text-danger" : "text-accent"}`}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>

          {/* Close Button Top-Right Corner */}
          <Pressable
            onPress={onCancel}
            className="absolute right-4 top-4 h-8 w-8 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10"
          >
            <X size={16} color="#94A3B8" />
          </Pressable>
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
