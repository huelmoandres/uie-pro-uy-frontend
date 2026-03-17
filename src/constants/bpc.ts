/**
 * BPC (Base de Prestaciones y Contribuciones) - Uruguay.
 * Valores oficiales por año. Actualizar cuando se publique nuevo decreto.
 * Fuentes: BPS, Presidencia (decretos de fijación).
 */

/** BPC en pesos uruguayos por año de vigencia. */
export const BPC_BY_YEAR: Record<number, number> = {
  2024: 6_177,
  2025: 6_576,
  2026: 6_864,
};

/** Años con BPC definido, ordenados descendente. */
const BPC_YEARS = Object.keys(BPC_BY_YEAR)
  .map(Number)
  .sort((a, b) => b - a);

/**
 * Devuelve el BPC para un año dado.
 * Si el año no está definido, usa el valor del año más reciente conocido.
 */
export function getBpcForYear(year: number): number {
  if (year in BPC_BY_YEAR) {
    return BPC_BY_YEAR[year];
  }
  const latestYear = BPC_YEARS[0];
  return BPC_BY_YEAR[latestYear];
}

/**
 * Devuelve el BPC formateado para mostrar (ej: "$6.864").
 */
export function formatBpc(bpc: number): string {
  return `$${bpc.toLocaleString("es-UY")}`;
}
