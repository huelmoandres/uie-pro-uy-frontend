/**
 * Storage keys and constants for onboarding and contextual tooltips.
 */

export const ONBOARDING_SEEN_KEY = "@iue_pro/onboarding_seen";

export const TOOLTIP_KEYS = {
  /** Shown once when user opens a long decree and sees the AI summary button */
  DECREE_AI_SUMMARY: "@iue_pro/tooltip_decree_ai_summary",
  /** Shown once when user views expediente list with at least one item - points to star */
  EXPEDIENTE_PIN_STAR: "@iue_pro/tooltip_expediente_pin_star",
} as const;
