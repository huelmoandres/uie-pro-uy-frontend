/**
 * Pure utility functions for formatting judicial data.
 * No side effects, fully testable.
 */

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

/**
 * Formats an ISO date string to a localized Spanish date string.
 * Example: "2024-03-15T00:00:00.000Z" → "15/03/2024"
 */
export function formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return 'Sin fecha';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Formats an ISO date string to a human-readable relative time in Spanish.
 * Example: "hace 3 días"
 */
export function formatRelativeDate(isoDate: string | null | undefined): string {
    if (!isoDate) return 'Sin sincronización';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'Fecha inválida';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 30) return `hace ${diffDays} días`;
    return formatDate(isoDate);
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
 *
 * Example: "LURIN S.A. <br><br>CONCURSO" → "LURIN S.A. CONCURSO"
 */
export function stripHtml(input: string | null | undefined): string {
    if (!input) return '';
    return input
        // Replace <br>, <br/>, <br /> with a space
        .replace(/<br\s*\/?>/gi, ' ')
        // Remove all remaining HTML tags
        .replace(/<[^>]+>/g, '')
        // Decode common HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        // Collapse multiple spaces into one
        .replace(/\s{2,}/g, ' ')
        .trim();
}
