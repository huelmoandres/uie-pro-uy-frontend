/**
 * AgendaWebView.tsx
 * ──────────────────
 * Main component for the Judicial Agenda module.
 * Wraps react-native-webview with:
 *   - A premium native header (title, close button, load indicator)
 *   - Bidirectional JS bridge via useAgendaBridge
 *   - Full TypeScript typesafety (no `any`)
 *
 * ai-rules.md: NativeWind styling, no Alert.alert, premium UX micro-interactions.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
    Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { X, Calendar, AlertCircle } from 'lucide-react-native';
import { useAgendaBridge } from '@hooks/useAgendaBridge';
import type { FormSubmittedPayload, DateSelectedPayload } from '@app-types/agenda.types';

// ──────────────────────────────────────────────────────────
// Constants — replace with real agenda URL per environment
// ──────────────────────────────────────────────────────────

const AGENDA_BASE_URL = 'https://agenda.poderjudicial.uy';

// ──────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────

interface AgendaWebViewProps {
    iue: string;
    sede: string;
    onClose: () => void;
    /** Optional callback when user completes booking. */
    onBookingComplete?: (payload: FormSubmittedPayload) => void;
    /** Custom URL override (useful for testing environments). */
    urlOverride?: string;
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export function AgendaWebView({
    iue,
    sede,
    onClose,
    onBookingComplete,
    urlOverride,
}: AgendaWebViewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(`Agendar Hora — ${iue}`);

    const webViewRef = useRef<WebView>(null);

    const handleFormSubmitted = useCallback(
        (payload: FormSubmittedPayload) => {
            onBookingComplete?.(payload);
        },
        [onBookingComplete]
    );

    const handleDateSelected = useCallback((_payload: DateSelectedPayload) => {
        // Future: show native date confirmation sheet
    }, []);

    const { injectedJS, handleMessage } = useAgendaBridge({
        iue,
        sede,
        onFormSubmitted: handleFormSubmitted,
        onDateSelected: handleDateSelected,
    });

    const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
        if (navState.title) {
            setCurrentTitle(`Agendar — ${iue}`);
        }
    }, [iue]);

    const targetUrl = urlOverride ?? `${AGENDA_BASE_URL}/?iue=${encodeURIComponent(iue)}&sede=${encodeURIComponent(sede)}`;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B1120]">
            <StatusBar barStyle="dark-content" />

            {/* ── Native Premium Header ── */}
            <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-primary">
                {/* Icon + Title */}
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
                            {currentTitle}
                        </Text>
                    </View>
                </View>

                {/* Right side: spinner OR close button */}
                <View className="flex-row items-center gap-2">
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color="#B89146"
                            style={{ marginRight: 4 }}
                        />
                    )}
                    <Pressable
                        onPress={onClose}
                        className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 active:opacity-70"
                        accessibilityLabel="Cerrar agenda"
                        accessibilityRole="button"
                    >
                        <X size={16} color="#64748B" />
                    </Pressable>
                </View>
            </View>

            {/* ── Error State ── */}
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
                /* ── WebView ── */
                <WebView
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
                    onNavigationStateChange={handleNavigationStateChange}
                    // Security: prevent the webview from navigating away to arbitrary URLs
                    originWhitelist={['https://agenda.poderjudicial.uy', 'about:blank']}
                    // Performance
                    cacheEnabled={Platform.OS === 'ios'}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    style={{ flex: 1 }}
                />
            )}
        </SafeAreaView>
    );
}
