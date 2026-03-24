/**
 * Claves y etiquetas de features premium para el soft lock y Paywall.
 * Usado por PremiumGateModal y PaywallHero para texto dinámico.
 */

export const PREMIUM_FEATURE_KEYS = {
  agenda: "agenda",
  compare: "compare",
  agendaTurno: "agenda-turno",
  sedes: "sedes",
  tributos: "tributos",
  dashboard: "dashboard",
  exportPdf: "export-pdf",
  resumenIa: "resumen-ia",
  addExpediente: "add-expediente",
  reminders: "reminders",
  tags: "tags",
} as const;

export type PremiumFeatureKey = keyof typeof PREMIUM_FEATURE_KEYS;

export const PREMIUM_FEATURE_LABELS: Record<PremiumFeatureKey, string> = {
  agenda: "Agenda Procesal",
  compare: "Comparar expedientes",
  agendaTurno: "Agendar turno",
  sedes: "Sedes Judiciales",
  tributos: "Tributos Judiciales",
  dashboard: "Dashboard",
  exportPdf: "Exportar a PDF",
  resumenIa: "Resumen con IA",
  addExpediente: "Agregar más expedientes",
  reminders: "Recordatorios",
  tags: "Etiquetas",
};

/** Mapa de param ?feature= a etiqueta (para modal y Paywall). */
export const FEATURE_PARAM_TO_LABEL: Record<string, string> = {
  agenda: "Agenda Procesal",
  compare: "Comparar expedientes",
  "agenda-turno": "Agendar turno",
  sedes: "Sedes Judiciales",
  tributos: "Tributos Judiciales",
  dashboard: "Dashboard",
  "export-pdf": "Exportar a PDF",
  "resumen-ia": "Resumen con IA",
  "add-expediente": "Agregar más expedientes",
  reminders: "Recordatorios",
  tags: "Etiquetas",
};

/** Texto dinámico para PaywallHero cuando viene con ?feature= (mejora conversión). */
export function getPaywallHeroSubtitle(
  featureParam: string | string[] | undefined,
): string {
  if (!featureParam || Array.isArray(featureParam)) return "";
  const label = FEATURE_PARAM_TO_LABEL[String(featureParam).toLowerCase()];
  if (!label) return "";
  return `Suscribite para desbloquear ${label} y todas las demás funciones.`;
}
