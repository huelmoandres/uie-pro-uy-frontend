/**
 * Pure utility functions for formatting judicial data.
 * Uses date-fns for reliable, locale-aware date formatting.
 * No side effects, fully testable.
 */
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── IUE ──────────────────────────────────────────────────────────────────────

/**
 * Validates that a string matches the judicial IUE format: "Sede-NroRegistro/Año"
 * Example: "2-5432/2023"
 */
export function isValidIue(iue: string): boolean {
    return /^\d+-\d+\/\d{4}$/.test(iue.trim());
}

/**
 * Normalizes an IUE string by trimming whitespace.
 */
export function normalizeIue(iue: string): string {
    return iue.trim().toUpperCase();
}

// ─── Dates ────────────────────────────────────────────────────────────────────

function parseDate(isoDate: string): Date | null {
    const date = parseISO(isoDate);
    return isValid(date) ? date : null;
}

/**
 * Formats an ISO date string to "dd/MM/yyyy".
 * Example: "2024-03-15T00:00:00.000Z" → "15/03/2024"
 */
export function formatDate(isoDate: string | Date | null | undefined): string {
    if (!isoDate) return 'Sin fecha';
    const date = isoDate instanceof Date ? isoDate : parseDate(isoDate);
    if (!date) return 'Fecha inválida';
    return format(date, 'dd/MM/yyyy');
}

/**
 * Formats an ISO date string to a human-readable relative time in Spanish.
 * Example: "hace 3 días", "en 2 días"
 */
export function formatRelativeDate(isoDate: string | null | undefined): string {
    if (!isoDate) return 'Sin sincronización';
    const date = parseDate(isoDate);
    if (!date) return 'Fecha inválida';
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

/**
 * Formats an ISO date string to a short human-readable format with month name.
 * Example: "15 mar. 2024"
 */
export function formatDateShort(isoDate: string | Date | null | undefined): string {
    if (!isoDate) return 'Sin fecha';
    const date = isoDate instanceof Date ? isoDate : parseDate(isoDate as string);
    if (!date) return 'Fecha inválida';
    return format(date, "d MMM yyyy", { locale: es });
}

// ─── Movement types ───────────────────────────────────────────────────────────

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
    DECRETO: 'Decreto',
    SENTENCIA: 'Sentencia',
    PROVEIDO: 'Proveído',
    DILIGENCIA: 'Diligencia',
};

/**
 * Returns a human-readable Spanish label for a movement type code.
 */
export function getMovementTypeLabel(tipo: string): string {
    return MOVEMENT_TYPE_LABELS[tipo.toUpperCase()] ?? tipo;
}

// ─── HTML Sanitization ────────────────────────────────────────────────────────

/**
 * Strips HTML tags from a string and decodes common HTML entities.
 * Used to sanitize caratula strings that may contain tags like <br>, &amp;, etc.
 */
export function stripHtml(input: string | null | undefined): string {
    if (!input) return '';
    return input
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}
