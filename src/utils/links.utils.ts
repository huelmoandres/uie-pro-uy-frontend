import { Linking } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Params for building map/navigation URLs.
 * Reusable for any location (venue, address, coordinates).
 */
export interface LocationParams {
  address?: string | null;
  cityName?: string;
  departmentName?: string;
  lat?: number | null;
  lng?: number | null;
}

/**
 * Builds a Google Maps URL for a location.
 * Prefers address (more precise) when available; falls back to coordinates (generic per city).
 */
export function buildGoogleMapsUrl(params: LocationParams): string | null {
  const { address, cityName, departmentName, lat, lng } = params;
  const addr = address?.trim();
  if (addr && (cityName || departmentName)) {
    const parts = [addr, cityName, departmentName, "Uruguay"].filter(Boolean);
    const q = encodeURIComponent(parts.join(", "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  return null;
}

/**
 * Builds a Waze navigation URL for a location.
 * Prefers address (more precise) when available; falls back to coordinates (generic per city).
 */
export function buildWazeUrl(params: LocationParams): string | null {
  const { address, cityName, departmentName, lat, lng } = params;
  const addr = address?.trim();
  if (addr && (cityName || departmentName)) {
    const parts = [addr, cityName, departmentName].filter(Boolean);
    const q = encodeURIComponent(parts.join(", "));
    return `https://waze.com/ul?q=${q}&navigate=yes`;
  }
  if (lat != null && lng != null) {
    return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  }
  return null;
}

/**
 * Parses a venue phone string (e.g. "1907 interno 8070" or "4779 2119").
 * Returns main number and optional interno (extension) for display and calling.
 */
export interface ParsedPhone {
  main: string;
  interno: string | null;
}

export function parsePhone(phone: string): ParsedPhone {
  const trimmed = phone.trim();
  const match = trimmed.match(/^(.+?)\s+internos?\s+(.+)$/i);
  if (match) {
    return {
      main: match[1].trim(),
      interno: match[2].replace(/\s*\([^)]*\)\s*$/, "").trim() || null,
    };
  }
  return { main: trimmed, interno: null };
}

/**
 * Returns a tel: URL with only the main number (digits) for calling.
 * If main has multiple numbers (e.g. "4722 2816 - 4723 6826"), uses the first.
 */
export function getTelUrl(parsed: ParsedPhone): string {
  const firstNumber = parsed.main.split(/\s*-\s*/)[0]?.trim() ?? parsed.main;
  const digits = firstNumber.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

/**
 * Opens an external URL (maps, tel, mailto, etc.).
 * Checks canOpenURL, triggers haptic feedback, and opens the link.
 * Silently ignores errors (e.g. app not installed).
 */
export async function openExternalUrl(
  url: string,
  options?: { haptic?: boolean },
): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      if (options?.haptic !== false) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await Linking.openURL(url);
    }
  } catch {
    // Silently ignore if app not installed or URL invalid
  }
}
