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
import Toast from 'react-native-toast-message';
import { toastConfig } from '@components/ui/ToastConfig';
import { LoadingOverlay } from '@components/shared/LoadingOverlay';

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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !isChecking) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isChecking]);

  if (!loaded || isChecking) {
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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Protected area */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Auth flow */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* Expediente detail */}
        <Stack.Screen
          name="expedientes"
          options={{ headerShown: false }}
        />
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
