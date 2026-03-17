/**
 * Utilidades para la pantalla de Tributos Judiciales.
 * Usa date-fns con timezone configurado (America/Montevideo).
 */
import { getBpcForYear, formatBpc } from "@constants/bpc";
import { getCurrentYearInAppTimezone } from "@utils/formatters";
import type { ITributo } from "@app-types/tributo.types";

/**
 * Filtra tributos por texto (processType o searchTerms).
 */
export function filterTributos(items: ITributo[], query: string): ITributo[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.processType.toLowerCase().includes(q) ||
      (item.searchTerms?.toLowerCase().includes(q) ?? false)
  );
}

/**
 * Años disponibles para el selector de tributos.
 * Usa el año actual en hora Uruguay.
 */
export function getTributosYearOptions(): number[] {
  const currentYear = getCurrentYearInAppTimezone();
  return [currentYear - 2, currentYear - 1, currentYear];
}

/**
 * Año por defecto para el selector (año actual en hora Uruguay).
 */
export function getTributosDefaultYear(): number {
  return getCurrentYearInAppTimezone();
}

/**
 * Construye el disclaimer de los tributos con BPC del año correspondiente.
 */
export function buildTributosDisclaimer(year: number): string {
  const bpcDisplay = formatBpc(getBpcForYear(year));
  return `Valores de referencia actualizados a ${year} (BPC ${bpcDisplay}). Verifique siempre la normativa vigente.`;
}
