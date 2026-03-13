export type DeadlineStatus = "OPEN" | "CLOSED" | "EXPIRED";

/** Plazo procesal detectado automáticamente — shape que devuelve GET /agenda */
export interface IAgendaItem {
  id: string;
  /** IUE del expediente, ej: "2-5432/2023" */
  iue: string;
  /** Carátula del expediente, null si aún no se cargó */
  caratula: string | null;
  days: number;
  /** BUSINESS_DAYS | CALENDAR_DAYS | UNSPECIFIED */
  deadlineType: string;
  /** Fragmento del decreto donde se detectó el plazo */
  detectedText: string;
  dueDate: string;
  /** Días restantes al vencimiento. Negativo si ya venció. */
  daysRemaining: number;
  status: DeadlineStatus;
  createdAt: string;
}

/** Agrupación de items para la vista de secciones */
export type AgendaSection = {
  key: string;
  title: string;
  emoji: string;
  items: IAgendaItem[];
};
