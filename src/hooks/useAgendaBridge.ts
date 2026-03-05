/**
 * useAgendaBridge.ts
 * ───────────────────
 * Custom hook that encapsulates the React Native <-> WebView bridge logic.
 * Handles typed message parsing, dev-mode logging, and injected script generation.
 *
 * ai-rules.md: No `any`. Hooks in camelCase. Logic out of components.
 */

import { useCallback, useMemo, useState } from 'react';
import { WebViewMessageEvent } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@context/AuthContext';
import { buildInjectedScript } from '@components/features/agenda/AgendaScripts';
import type {
    IueData,
    WebViewMessage,
    WebViewMessageType,
    InputFocusedPayload,
    InputChangedPayload,
    DateSelectedPayload,
    FormSubmittedPayload,
    WebViewErrorPayload,
    GuidanceNeededPayload,
} from '@app-types/agenda.types';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

type KnownPayloads = {
    INPUT_FOCUSED: InputFocusedPayload;
    INPUT_CHANGED: InputChangedPayload;
    DATE_SELECTED: DateSelectedPayload;
    FORM_SUBMITTED: FormSubmittedPayload;
    NAVIGATION_STATE_CHANGE: Record<string, unknown>;
    GUIDANCE_NEEDED: GuidanceNeededPayload;
    STEP_COMPLETED: { step: string };
    ERROR: WebViewErrorPayload;
};

interface UseAgendaBridgeOptions {
    iues: string[];
    sede: string;
    /** Called when the web form is successfully submitted. */
    onFormSubmitted?: (payload: FormSubmittedPayload) => void;
    /** Called when a date is selected in the web calendar. */
    onDateSelected?: (payload: DateSelectedPayload) => void;
}

interface UseAgendaBridgeReturn {
    /** Pre-built JS string for `injectedJavaScriptBeforeContentLoaded`. */
    injectedJS: string;
    /** Handler to pass directly to WebView's `onMessage` prop. */
    handleMessage: (event: WebViewMessageEvent) => void;
}

// ──────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────

export function useAgendaBridge({
    iues,
    sede,
    onFormSubmitted,
    onDateSelected,
}: UseAgendaBridgeOptions): UseAgendaBridgeReturn {
    const { user } = useAuth();
    const [sessionState, setSessionState] = useState<Record<string, string>>({});

    const iueData: IueData = useMemo(() => {
        const data = {
            iues,
            sede,
            userData: user ? {
                name: user.name,
                email: user.email,
                phone: user.phone,
                cedula: user.cedula,
            } : undefined,
            sessionState,
        };
        return data;
    }, [iues, sede, user, sessionState]);

    /** Memoized injection script — only rebuilt if iueData changes. */
    const injectedJS = useMemo(() => buildInjectedScript(iueData), [iueData]);

    const handleMessage = useCallback(
        (event: WebViewMessageEvent) => {
            let parsed: WebViewMessage<KnownPayloads[WebViewMessageType]> | null = null;

            try {
                parsed = JSON.parse(event.nativeEvent.data) as WebViewMessage<
                    KnownPayloads[WebViewMessageType]
                >;
            } catch {
                if (__DEV__) {
                    console.warn('[AgendaBridge] Failed to parse WebView message:', event.nativeEvent.data);
                }
                return;
            }

            switch (parsed.type) {
                case 'INPUT_FOCUSED': {
                    // Logged above in dev mode. Could trigger haptics here.
                    break;
                }
                case 'INPUT_CHANGED': {
                    const { fieldId, value } = parsed.payload as InputChangedPayload;
                    setSessionState(prev => ({ ...prev, [fieldId]: value }));
                    break;
                }
                case 'DATE_SELECTED': {
                    onDateSelected?.(parsed.payload as DateSelectedPayload);
                    break;
                }
                case 'FORM_SUBMITTED': {
                    onFormSubmitted?.(parsed.payload as FormSubmittedPayload);
                    break;
                }
                case 'GUIDANCE_NEEDED': {
                    const guidance = parsed.payload as GuidanceNeededPayload;
                    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    Toast.show({
                        type: 'info',
                        text1: '📋 Acción requerida',
                        text2: guidance.message,
                        visibilityTime: 5000,
                        position: 'top',
                        topOffset: 110,
                    });
                    break;
                }
                case 'STEP_COMPLETED': {
                    const { step } = parsed.payload as { step: string };
                    if (step === 'DATOS_PERSONALES') {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Toast.show({
                            type: 'success',
                            text1: '✅ Datos precargados',
                            text2: 'Revisá tus datos y seleccioná la hora del turno.',
                            visibilityTime: 4000,
                            position: 'top',
                            topOffset: 110,
                        });
                    }
                    break;
                }
                case 'ERROR': {
                    if (__DEV__) {
                        console.error('[AgendaBridge] ❌ WebView error:', parsed.payload);
                    }
                    break;
                }
                default:
                    break;
            }
        },
        [onFormSubmitted, onDateSelected]
    );

    return { injectedJS, handleMessage };
}
