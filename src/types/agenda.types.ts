/**
 * Agenda Judicial — TypeScript Interfaces
 * ----------------------------------------
 * Defines the strict contract for the WebView <-> React Native bridge.
 * No `any` allowed (ai-rules.md §3).
 */

// ──────────────────────────────────────────────────────────
// Messages FROM the WebView TO the native app
// ──────────────────────────────────────────────────────────

/** All supported message types the WebView can emit. */
export type WebViewMessageType =
    | 'INPUT_FOCUSED'
    | 'FORM_SUBMITTED'
    | 'DATE_SELECTED'
    | 'NAVIGATION_STATE_CHANGE'
    | 'ERROR';

/** Generic typed wrapper for every message from the WebView. */
export interface WebViewMessage<TPayload = Record<string, unknown>> {
    type: WebViewMessageType;
    payload: TPayload;
    timestamp: number; // Unix epoch ms, for deduplication
}

// ──────────────────────────────────────────────────────────
// Payloads (strongly typed per message type)
// ──────────────────────────────────────────────────────────

export interface InputFocusedPayload {
    fieldName: string;
    fieldId: string;
}

export interface DateSelectedPayload {
    isoDate: string; // ISO 8601 (e.g. "2026-03-15T10:30:00")
    label: string;   // Human-readable label shown in the web form
}

export interface FormSubmittedPayload {
    success: boolean;
    iue: string;
    confirmationCode?: string;
    errorMessage?: string;
}

export interface WebViewErrorPayload {
    code: number;
    description: string;
    url: string;
}

// ──────────────────────────────────────────────────────────
// Data injected FROM the app INTO the WebView
// ──────────────────────────────────────────────────────────

/** Data the app passes to the web agenda form via injected JS. */
export interface IueData {
    iue: string;
    sede: string;
}
