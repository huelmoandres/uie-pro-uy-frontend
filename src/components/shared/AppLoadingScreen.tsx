import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Scale } from "lucide-react-native";
import { useColorScheme } from "@/components/base/useColorScheme";

interface Props {
  /** Mensaje secundario opcional bajo el subtítulo de la marca. */
  message?: string;
}

/**
 * Pantalla de carga inicial que reemplaza el `return null`.
 * Se muestra mientras se cargan fuentes, se verifica OTA o se restaura el tema.
 * Diseño compacto y centrado, compatible con dark/light mode.
 */
export function AppLoadingScreen({ message }: Props = {}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    const dur = 500;
    const cfg = { duration: dur, easing: Easing.inOut(Easing.ease) };

    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    dot1.value = withRepeat(
      withSequence(withTiming(1, cfg), withTiming(0.3, cfg)),
      -1,
      false,
    );
    dot2.value = withDelay(
      180,
      withRepeat(
        withSequence(withTiming(1, cfg), withTiming(0.3, cfg)),
        -1,
        false,
      ),
    );
    dot3.value = withDelay(
      360,
      withRepeat(
        withSequence(withTiming(1, cfg), withTiming(0.3, cfg)),
        -1,
        false,
      ),
    );
  }, [dot1, dot2, dot3, iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));
  const d1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const d2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const d3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  const bg = isDark ? "#060E1E" : "#F8FAFC";
  const dotColor = isDark ? "rgba(184,145,70,0.8)" : "rgba(184,145,70,0.6)";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.content}>
        {/* Icon */}
        <Animated.View style={[styles.iconWrapper, iconStyle]}>
          <Scale size={26} color="#B89146" strokeWidth={1.6} />
        </Animated.View>

        {/* Brand */}
        <Text style={[styles.title, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
          IUE Tracker
        </Text>
        <Text
          style={[styles.subtitle, { color: isDark ? "#64748B" : "#94A3B8" }]}
        >
          {message ?? "Seguimiento judicial"}
        </Text>

        {/* Animated dots */}
        <View style={styles.dots}>
          <Animated.View
            style={[styles.dot, d1Style, { backgroundColor: dotColor }]}
          />
          <Animated.View
            style={[styles.dot, d2Style, { backgroundColor: dotColor }]}
          />
          <Animated.View
            style={[styles.dot, d3Style, { backgroundColor: dotColor }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 6,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(184,145,70,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  dots: {
    flexDirection: "row",
    gap: 5,
    marginTop: 16,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
