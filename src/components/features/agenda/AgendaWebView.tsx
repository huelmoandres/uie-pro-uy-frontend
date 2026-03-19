/**
 * AgendaWebView.tsx
 * ──────────────────
 * Main component for the Judicial Agenda module.
 *
 * Runtime behaviour:
 *   • Dev Build  → renders a full inline WebView with full JS bridge.
 *   • Expo Go    → react-native-webview native module is NOT available;
 *                  falls back to expo-web-browser (external browser).
 *
 * Note: the `require()` trick is intentional — it avoids a crash at module-
 * load time when the TurboModule is missing (Expo Go).
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import { toastConfig } from "@components/ui/ToastConfig";
import { ProfileDataWarningModal } from "@components/ui";
import { X, Calendar, AlertCircle, ExternalLink } from "lucide-react-native";
import { useAgendaBridge } from "@hooks/useAgendaBridge";
import { useAuth } from "@context/AuthContext";
import { router } from "expo-router";
import type {
  FormSubmittedPayload,
  DateSelectedPayload,
} from "@app-types/agenda.types";

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const AGENDA_BASE_URL = "https://agenda.poderjudicial.gub.uy";

// ──────────────────────────────────────────────────────────
// Native WebView — lazy conditional require
// ──────────────────────────────────────────────────────────

/**
 * Safely try to load the native WebView.
 * In Expo Go the TurboModule won't exist, so require() throws — we catch it
 * and return null, which triggers the expo-web-browser fallback below.
 */
let NativeWebView: typeof import("react-native-webview").WebView | null = null;
try {
  NativeWebView = require("react-native-webview").WebView;
} catch {
  NativeWebView = null;
}

const isWebViewAvailable = NativeWebView !== null;

// ──────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────

interface AgendaWebViewProps {
  iues: string[];
  sede: string;
  onClose: () => void;
  onBookingComplete?: (payload: FormSubmittedPayload) => void;
  urlOverride?: string;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export function AgendaWebView({
  iues,
  sede,
  onClose,
  onBookingComplete,
  urlOverride,
}: AgendaWebViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

   
  const webViewRef = useRef<any>(null);

  const handleFormSubmitted = useCallback(
    (payload: FormSubmittedPayload) => {
      onBookingComplete?.(payload);
    },
    [onBookingComplete],
  );

  const handleDateSelected = useCallback((_payload: DateSelectedPayload) => {
    // Future: native date confirmation sheet
  }, []);

  const { user } = useAuth();
  const { injectedJS, handleMessage } = useAgendaBridge({
    iues,
    sede,
    onFormSubmitted: handleFormSubmitted,
    onDateSelected: handleDateSelected,
  });

  const lacksCedulaOrPhone = useMemo(
    () => !user?.cedula?.trim() || !user?.phone?.trim(),
    [user?.cedula, user?.phone],
  );

  const [showProfileWarning, setShowProfileWarning] = useState(lacksCedulaOrPhone);

  useEffect(() => {
    if (!lacksCedulaOrPhone) setShowProfileWarning(false);
  }, [lacksCedulaOrPhone]);

  const handleProfileWarningEntendido = useCallback(() => {
    setShowProfileWarning(false);
  }, []);

  const handleProfileWarningIrAConfiguracion = useCallback(() => {
    setShowProfileWarning(false);
    onClose();
    router.push("/settings");
  }, [onClose]);

  // Use first IUE for the URL generation if applicable
  const primaryIue = iues[0] || "";
  const targetUrl =
    urlOverride ??
    `${AGENDA_BASE_URL}/?iue=${encodeURIComponent(primaryIue)}&sede=${encodeURIComponent(sede)}`;

  const headerTitle =
    iues.length > 1 ? `${iues.length} Expedientes` : iues[0] || "Agendar";

  // ── Expo Go fallback ──────────────────────────────────
  if (!isWebViewAvailable) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0B1120]">
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-primary">
          <View className="flex-row items-center gap-3 flex-1 mr-4">
            <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-accent/10">
              <Calendar size={18} color="#B89146" />
            </View>
            <View className="flex-1">
              <Text
                className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent"
                numberOfLines={1}
              >
                Agenda Judicial
              </Text>
              <Text
                className="text-sm font-sans-bold text-slate-900 dark:text-white"
                numberOfLines={1}
              >
                Agendar Hora — {headerTitle}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 active:opacity-70"
          >
            <X size={16} color="#64748B" />
          </Pressable>
        </View>

        {/* Fallback body */}
        <View className="flex-1 items-center justify-center px-10">
          <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-accent/10 mb-6">
            <ExternalLink size={36} color="#B89146" />
          </View>
          <Text className="text-center font-sans-bold text-lg text-slate-900 dark:text-white">
            Abrí la Agenda en tu navegador
          </Text>
          <Text className="mt-3 text-center font-sans text-sm leading-relaxed text-slate-500">
            La agenda judicial integrada requiere una{" "}
            <Text className="font-sans-bold text-slate-700 dark:text-slate-300">
              Development Build
            </Text>{" "}
            de la app. Por ahora podés agendar directamente desde tu navegador.
          </Text>
          <Pressable
            className="mt-8 flex-row items-center gap-3 rounded-full bg-accent px-8 py-4 shadow-lg shadow-accent/30 active:opacity-80"
            onPress={() => WebBrowser.openBrowserAsync(targetUrl)}
          >
            <ExternalLink size={16} color="#FFFFFF" />
            <Text className="font-sans-bold text-sm uppercase tracking-widest text-white">
              Abrir Agenda
            </Text>
          </Pressable>
          <Pressable className="mt-4 py-3" onPress={onClose}>
            <Text className="font-sans text-sm text-slate-400">Cancelar</Text>
          </Pressable>
        </View>
        <ProfileDataWarningModal
          visible={showProfileWarning}
          onEntendido={handleProfileWarningEntendido}
          onIrAConfiguracion={handleProfileWarningIrAConfiguracion}
        />
        <Toast config={toastConfig} />
      </SafeAreaView>
    );
  }

  // ── Full inline WebView (Dev Build) ───────────────────
  const WebViewComponent = NativeWebView!;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0B1120]">
      <StatusBar barStyle="dark-content" />

      {/* Header — elevated above WebView with zIndex */}
      <View
        className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-primary"
        style={{ zIndex: 10, elevation: 10 }}
      >
        <View className="flex-row items-center gap-3 flex-1 mr-4">
          <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-accent/10">
            <Calendar size={18} color="#B89146" />
          </View>
          <View className="flex-1">
            <Text
              className="text-[10px] font-sans-bold uppercase tracking-[2px] text-accent"
              numberOfLines={1}
            >
              Agenda Judicial
            </Text>
            <Text
              className="text-sm font-sans-bold text-slate-900 dark:text-white"
              numberOfLines={1}
            >
              Agendar Hora — {headerTitle}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#B89146"
              style={{ marginRight: 4 }}
            />
          )}
          {/* TouchableOpacity is more reliable inside WebView contexts */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.7}
            style={{
              height: 36,
              width: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              backgroundColor: "rgba(100, 116, 139, 0.12)",
            }}
            accessibilityLabel="Cerrar agenda"
            accessibilityRole="button"
          >
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error State */}
      {hasError ? (
        <View className="flex-1 items-center justify-center px-10">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="mt-4 text-center font-sans-bold text-lg text-slate-900 dark:text-white">
            No se pudo cargar la Agenda
          </Text>
          <Text className="mt-2 text-center font-sans text-sm text-slate-500">
            Verificá tu conexión a Internet e intentá nuevamente.
          </Text>
          <Pressable
            className="mt-6 rounded-full bg-accent px-8 py-3 active:opacity-80"
            onPress={() => {
              setHasError(false);
              webViewRef.current?.reload();
            }}
          >
            <Text className="font-sans-bold text-sm uppercase tracking-widest text-white">
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : (
        <WebViewComponent
          ref={webViewRef}
          source={{ uri: targetUrl }}
          injectedJavaScriptBeforeContentLoaded={injectedJS}
          onMessage={handleMessage}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onHttpError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          // Security: allow the agenda domain and any potential redirects
          originWhitelist={[
            "https://*.poderjudicial.gub.uy",
            "https://*.poderjudicial.uy",
            "about:blank",
            "https://*",
          ]}
          cacheEnabled={Platform.OS === "ios"}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          style={{ flex: 1 }}
        />
      )}
      <ProfileDataWarningModal
        visible={showProfileWarning}
        onEntendido={handleProfileWarningEntendido}
        onIrAConfiguracion={handleProfileWarningIrAConfiguracion}
      />
      <Toast config={toastConfig} topOffset={110} />
    </SafeAreaView>
  );
}
