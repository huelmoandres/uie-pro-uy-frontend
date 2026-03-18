import "../../global.css"; // Primary entry for NativeWind
import { initErrorTracking } from "@utils/errorTracking";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { Platform, StyleSheet, Pressable } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/components/base/useColorScheme";
import { AuthProvider, useAuth } from "@context/AuthContext";
import {
  SubscriptionProvider,
  useSubscription,
} from "@context/SubscriptionContext";
import { QueryProvider } from "@providers/QueryProvider";
import {
  useNotifications,
  requestAndRegisterNotifications,
} from "@hooks/useNotifications";
import { OnboardingProvider } from "@context/OnboardingContext";
import { useAppUpdates } from "@hooks/useAppUpdates";
import { useNavigationRedirects } from "@hooks/useNavigationRedirects";
import { getStackScreenOptions } from "@/navigation/stackScreenOptions";
import { useRestoreColorScheme } from "@hooks/useAppColorScheme";
import Toast from "react-native-toast-message";
import { toastConfig } from "@components/ui/ToastConfig";
import { LoadingOverlay } from "@components/shared/LoadingOverlay";
import { AppLoadingScreen } from "@components/shared/AppLoadingScreen";
import { NetworkBanner } from "@components/shared/NetworkBanner";
import { NotificationPermissionModal } from "@components/shared/NotificationPermissionModal";

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

initErrorTracking();

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { isChecking, isDownloading } = useAppUpdates();
  const isThemeReady = useRestoreColorScheme();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !isChecking && isThemeReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isChecking, isThemeReady]);

  if (!loaded || isChecking || !isThemeReady) {
    return (
      <AppLoadingScreen
        message={isChecking ? "Verificando actualizaciones..." : undefined}
      />
    );
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <SubscriptionWrapper>
          <OnboardingProvider>
            <RootLayoutNav />
            <LoadingOverlay
              visible={isDownloading}
              message="Descargando actualización..."
            />
          </OnboardingProvider>
        </SubscriptionWrapper>
      </AuthProvider>
    </QueryProvider>
  );
}

// ─── Subscription wrapper (needs AuthContext) ───────────────────────────────────

function SubscriptionWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  return (
    <SubscriptionProvider
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
      userName={user?.name ?? null}
      isAuthLoading={isAuthLoading}
    >
      {children}
    </SubscriptionProvider>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, signOut } = useAuth();
  const [, setEmergencyTapCount] = useState(0);

  useNotifications(isAuthenticated);

  const redirects = useNavigationRedirects();
  const {
    showLoadingOverlay,
    loadingMessage,
    redirectTarget,
    shouldRedirect,
  } = redirects;

  const isDark = colorScheme === "dark";

  const { isPro, isInTrial } = useSubscription();

  // Bloquear volver atrás desde paywall cuando el usuario no tiene acceso.
  // Evita loop: usuario vuelve → redirect a paywall → vuelve → redirect...
  const blockPaywallBack =
    isAuthenticated && !isPro && !isInTrial;

  useEffect(() => {
    if (!showLoadingOverlay) setEmergencyTapCount(0);
  }, [showLoadingOverlay]);

  // Escape de emergencia: 5 toques en el overlay para cerrar sesión si está atascado
  const handleOverlayPress = useCallback(() => {
    if (!isAuthenticated) return;
    setEmergencyTapCount((c) => {
      const next = c + 1;
      if (next >= 5) {
        void signOut();
        return 0;
      }
      return next;
    });
  }, [isAuthenticated, signOut]);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={getStackScreenOptions(isDark)}>
        {/* Protected area */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Auth flow */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* Expediente detail */}
        <Stack.Screen
          name="expedientes/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="expedientes/compare"
          options={{ title: "Comparar expedientes" }}
        />
        <Stack.Screen
          name="expedientes/updates"
          options={{ title: "Expedientes con novedades" }}
        />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="linked-devices" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen
          name="paywall"
          options={{
            title: "IUE.uy Pro",
            ...(blockPaywallBack
              ? { headerLeft: () => null, gestureEnabled: false }
              : {}),
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {showLoadingOverlay && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleOverlayPress}
          accessible={false}
        >
          <AppLoadingScreen message={loadingMessage} />
        </Pressable>
      )}

      {/* Un solo Redirect para evitar loops por competencia entre múltiples Redirects */}
      {shouldRedirect && redirectTarget && (
        <Redirect href={redirectTarget as any} />
      )}

      <Toast config={toastConfig} topOffset={Platform.OS === "ios" ? 60 : 40} />

      {/* Global network connectivity banner */}
      <NetworkBanner />

      {/* Notification permission pre-prompt — only shown to authenticated users */}
      {isAuthenticated && (
        <NotificationPermissionModal
          onRequestPermission={async () => {
            await requestAndRegisterNotifications();
          }}
        />
      )}
    </ThemeProvider>
  );
}
