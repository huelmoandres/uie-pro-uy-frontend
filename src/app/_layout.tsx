import '../../global.css'; // Primary entry for NativeWind
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/base/useColorScheme';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { QueryProvider } from '@providers/QueryProvider';
import { useNotifications } from '@hooks/useNotifications';
import { useAppUpdates } from '@hooks/useAppUpdates';
import { useRestoreColorScheme } from '@hooks/useAppColorScheme';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@components/ui/ToastConfig';
import { LoadingOverlay } from '@components/shared/LoadingOverlay';
import { HeaderBackButton } from '@components/shared/HeaderBackButton';

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
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
    return null;
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <RootLayoutNav />
        {isDownloading && (
          <LoadingOverlay visible={isDownloading} message="Descargando actualización..." />
        )}
      </AuthProvider>
    </QueryProvider>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  // Register for push notifications (Side effect only, safe for layout stability)
  useNotifications();

  if (isLoading) {
    return null;
  }

  const inAuthGroup = segments[0] === '(auth)';

  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#0B1120' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDark
              ? 'rgba(255,255,255,0.05)'
              : '#F1F5F9',
          } as any,
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: isDark ? '#F8FAFC' : '#0F172A',
          },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerBackTitle: '',
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
        <Stack.Screen name="notifications" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* 
        Refined Redirection Logic:
        Only redirect if NOT authenticated AND NOT already in the auth flow.
        Prevents full-tree re-renders/flickers during login errors.
      */}
      {!isAuthenticated && !inAuthGroup && <Redirect href="/(auth)/login" />}

      <Toast config={toastConfig} topOffset={Platform.OS === 'ios' ? 60 : 40} />
    </ThemeProvider>
  );
}
