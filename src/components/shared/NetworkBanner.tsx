import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { WifiOff, Wifi } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "@hooks/useNetworkStatus";

const SHOW_RECONNECTED_MS = 2500;
const ANIM_MS = 280;

type BannerMode = "offline" | "reconnected" | "hidden";

/**
 * Banner global de estado de red.
 * - Offline: aparece arriba en rojo/naranja con "Sin conexión a internet"
 * - Reconectado: muestra brevemente "Conexión restaurada" en verde y desaparece
 * Vive en el root layout para cubrir toda la app.
 */
export function NetworkBanner() {
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetworkStatus();

  const mode = useRef<BannerMode>("hidden");
  const translateY = useSharedValue(-80);
  const reconnectedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayMode, setDisplayMode] = React.useState<BannerMode>("hidden");

  // Trigger animation based on network changes
  useEffect(() => {
    if (reconnectedTimer.current) {
      clearTimeout(reconnectedTimer.current);
      reconnectedTimer.current = null;
    }

    if (!isOnline) {
      mode.current = "offline";
      setDisplayMode("offline");
      translateY.value = withTiming(0, {
        duration: ANIM_MS,
        easing: Easing.out(Easing.ease),
      });
    } else {
      if (mode.current === "offline") {
        // Was offline → now online: show "reconnected" briefly
        mode.current = "reconnected";
        setDisplayMode("reconnected");
        translateY.value = withTiming(0, {
          duration: ANIM_MS,
          easing: Easing.out(Easing.ease),
        });

        reconnectedTimer.current = setTimeout(() => {
          mode.current = "hidden";
          translateY.value = withDelay(
            100,
            withTiming(
              -80,
              { duration: ANIM_MS, easing: Easing.in(Easing.ease) },
              () => {
                runOnJS(setDisplayMode)("hidden");
              },
            ),
          );
        }, SHOW_RECONNECTED_MS);
      } else if (mode.current === "hidden") {
        // Initial state: already online, do nothing
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- translateY SharedValue estable
  }, [isOnline]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (displayMode === "hidden") return null;

  const isOffline = displayMode === "offline";
  const topPadding = insets.top + (Platform.OS === "android" ? 4 : 0);

  return (
    <Animated.View
      style={[styles.container, animStyle, { paddingTop: topPadding }]}
    >
      <View
        style={[
          styles.banner,
          isOffline ? styles.offlineBanner : styles.onlineBanner,
        ]}
      >
        {isOffline ? (
          <WifiOff size={13} color="#FFFFFF" strokeWidth={2} />
        ) : (
          <Wifi size={13} color="#FFFFFF" strokeWidth={2} />
        )}
        <Text style={styles.text}>
          {isOffline ? "Sin conexión a internet" : "Conexión restaurada"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  offlineBanner: {
    backgroundColor: "#DC2626",
    shadowColor: "#DC2626",
  },
  onlineBanner: {
    backgroundColor: "#16A34A",
    shadowColor: "#16A34A",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
