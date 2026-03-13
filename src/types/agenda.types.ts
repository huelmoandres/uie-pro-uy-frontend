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
  | "INPUT_FOCUSED"
  | "INPUT_CHANGED"
  | "FORM_SUBMITTED"
  | "DATE_SELECTED"
  | "NAVIGATION_STATE_CHANGE"
  | "GUIDANCE_NEEDED"
  | "STEP_COMPLETED"
  | "ERROR";

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

export interface InputChangedPayload {
  fieldId: string;
  fieldName: string;
  value: string;
}

export interface DateSelectedPayload {
  isoDate: string; // ISO 8601 (e.g. "2026-03-15T10:30:00")
  label: string; // Human-readable label shown in the web form
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

export interface GuidanceNeededPayload {
  message: string;
  step: string; // e.g. 'SELECT_TRAMITE', 'SELECT_DATE'
}

// ──────────────────────────────────────────────────────────
// Data injected FROM the app INTO the WebView
// ──────────────────────────────────────────────────────────

/** Data the app passes to the web agenda form via injected JS. */
export interface IueData {
  iues: string[];
  sede: string;
  userData?: {
    name: string | null;
    email: string;
    phone: string | null;
    cedula: string | null;
  };
  /** Temporary data stored across sessions (persisted during current agenda flow) */
  sessionState?: Record<string, string>;
}
