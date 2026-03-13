import type { CaseStage } from "./expediente.types";

export interface IDeadlineSummary {
  id: string;
  expedienteIue: string;
  expedienteCaratula: string | null;
  dueDate: string;
  daysRemaining: number;
  detectedText: string;
}

export interface IRecentMovement {
  expedienteIue: string;
  expedienteCaratula: string | null;
  tipo: string;
  fecha: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface IDormantExpediente {
  iue: string;
  caratula: string | null;
  lastActivityDate: string | null;
  daysSinceLastActivity: number;
}

export interface IStageDistribution {
  stage: CaseStage;
  count: number;
}

export interface IDashboardStats {
  totalFollowed: number;
  activeInLast30Days: number;
  openDeadlines: number;
  urgentDeadlineCount: number;
}

export interface IDashboardSummary {
  urgentDeadlines: IDeadlineSummary[];
  warningDeadlines: IDeadlineSummary[];
  dormantExpedientes: IDormantExpediente[];
  recentHighPriorityMovements: IRecentMovement[];
  stageDistribution: IStageDistribution[];
  stats: IDashboardStats;
}
