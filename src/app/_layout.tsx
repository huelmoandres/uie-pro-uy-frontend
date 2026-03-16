import "../../global.css"; // Primary entry for NativeWind
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
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
import { useAppUpdates } from "@hooks/useAppUpdates";
import { useRestoreColorScheme } from "@hooks/useAppColorScheme";
import Toast from "react-native-toast-message";
import { toastConfig } from "@components/ui/ToastConfig";
import { LoadingOverlay } from "@components/shared/LoadingOverlay";
import { AppLoadingScreen } from "@components/shared/AppLoadingScreen";
import { NetworkBanner } from "@components/shared/NetworkBanner";
import { HeaderBackButton } from "@components/shared/HeaderBackButton";
import { NotificationPermissionModal } from "@components/shared/NotificationPermissionModal";

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

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
          <RootLayoutNav />
          <LoadingOverlay
            visible={isDownloading}
            message="Descargando actualización..."
          />
        </SubscriptionWrapper>
      </AuthProvider>
    </QueryProvider>
  );
}

// ─── Subscription wrapper (needs AuthContext) ───────────────────────────────────

function SubscriptionWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <SubscriptionProvider
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
    >
      {children}
    </SubscriptionProvider>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();
  const {
    isPro,
    isInTrial,
    isLoading: isSubscriptionLoading,
  } = useSubscription();

  useNotifications(isAuthenticated);

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  const inAuthGroup = segments[0] === "(auth)";
  const inPaywall = (segments as string[]).includes("paywall");

  // Usuario autenticado sin suscripción → bloquear en Paywall (onboarding de pago)
  const mustSeePaywall =
    isAuthenticated &&
    !isSubscriptionLoading &&
    !isPro &&
    !isInTrial &&
    !inPaywall;

  if (isAuthenticated && isSubscriptionLoading) {
    return <AppLoadingScreen message="Verificando suscripción..." />;
  }

  const isDark = colorScheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#0B1120" : "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
          } as any,
          headerTitleStyle: {
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: isDark ? "#F8FAFC" : "#0F172A",
          },
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerBackTitle: "",
          headerBackVisible: false,
          headerLeft: ({ canGoBack }) =>
            canGoBack ? <HeaderBackButton /> : null,
        }}
      >
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
        <Stack.Screen name="paywall" options={{ title: "IUE.uy Pro" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* 
        Refined Redirection Logic:
        Only redirect if NOT authenticated AND NOT already in the auth flow.
        Prevents full-tree re-renders/flickers during login errors.
      */}
      {!isAuthenticated && !inAuthGroup && <Redirect href="/(auth)/login" />}
      {mustSeePaywall && <Redirect href="/paywall" />}

      <Toast config={toastConfig} topOffset={Platform.OS === "ios" ? 60 : 40} />

      {/* Global network connectivity banner */}
      <NetworkBanner />

      {/* Notification permission pre-prompt — only shown to authenticated users */}
      {isAuthenticated && (
        <NotificationPermissionModal
          onRequestPermission={requestAndRegisterNotifications}
        />
      )}
    </ThemeProvider>
  );
}
