import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Scale } from "lucide-react-native";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * Overlay compacto para bloquear la UI durante operaciones críticas (ej: OTA updates).
 * Se muestra centrado con una tarjeta pequeña, sin dominar la pantalla.
 */
export function LoadingOverlay({
  visible,
  message = "Cargando...",
}: LoadingOverlayProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = 1;
    }
  }, [visible]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />
      <View style={styles.card}>
        <Animated.View style={[styles.iconWrapper, iconStyle]}>
          <Scale size={20} color="#B89146" strokeWidth={1.6} />
        </Animated.View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 14, 30, 0.65)",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0B1120",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(184,145,70,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    color: "#CBD5E1",
    letterSpacing: 0.1,
  },
});
