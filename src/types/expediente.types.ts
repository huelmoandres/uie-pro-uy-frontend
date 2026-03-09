/**
 * Interfaces that mirror the backend DTOs (ExpedienteResponseDto, MovementDto, DecreeDto).
 * Single source of truth for all expediente-related types in the app.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum FollowStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
}

export type MovementCategory = 'DECREE' | 'NOTIFICATION' | 'WRITING' | 'AUDIENCE' | 'INTERNAL';
export type MovementPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type CaseStage =
    | 'FILING'
    | 'PRELIMINARY'
    | 'EVIDENCE'
    | 'PLEADINGS'
    | 'JUDGMENT'
    | 'APPEAL'
    | 'ENFORCEMENT';
export type ActivityStatus = 'ACTIVE' | 'ON_TRACK' | 'DELAYED' | 'DORMANT' | 'UNKNOWN';
export type DeadlineType = 'BUSINESS_DAYS' | 'CALENDAR_DAYS' | 'UNSPECIFIED';

// ─── Models ──────────────────────────────────────────────────────────────────

export interface IMovementClassification {
    type: MovementCategory;
    priority: MovementPriority;
}

export interface IDeadlineDetectionResult {
    hasDeadline: boolean;
    days?: number;
    type?: DeadlineType;
    detectedText?: string;
}

export interface IDecreeSummary {
    summary: string;
    highlights: string[];
    hasDeadline: boolean;
    requiresAction: boolean;
    actionDescription: string | null;
    generatedAt: string | null;
    fromCache: boolean;
    textTruncated: boolean;
}

export interface IDecree {
    /** ID del decreto en la base de datos. Necesario para el endpoint de resumen IA. */
    id: string;
    textoDecreto: string | null;
    isReserved: boolean;
    nroDecreto: string | null;
    deadline?: IDeadlineDetectionResult | null;
}

export interface IMovement {
    fecha: string;
    tipo: string;
    sede: string;
    orden: number | null;
    decree: IDecree | null;
    classification?: IMovementClassification;
}

export interface IInternalGroup {
    type: 'INTERNAL_PROCESS';
    count: number;
    movements: IMovement[];
}

export type TimelineEntry = IMovement | IInternalGroup;

export function isInternalGroup(entry: TimelineEntry): entry is IInternalGroup {
    return (entry as IInternalGroup).type === 'INTERNAL_PROCESS';
}

export function flattenTimeline(entries: TimelineEntry[]): IMovement[] {
    return entries.flatMap((e) => (isInternalGroup(e) ? e.movements : [e]));
}

export interface ICaseStageResult {
    stage: CaseStage;
    confidence: number;
    detectedAt: string | null;
}

export interface IExpedienteStats {
    totalMovements: number;
    firstMovementDate: string | null;
    lastMovementDate: string | null;
    averageDaysBetweenMovements: number;
}

export interface IActivityPrediction {
    status: ActivityStatus;
    lastActivityDate: string | null;
    daysSinceLastActivity: number | null;
}

export interface ICaratulaComponents {
    plaintiff: string | null;
    defendant: string | null;
    caseType: string | null;
}

export interface IExpediente {
    iue: string;
    caratula: string | null;
    sede: string;
    nroRegistro: number;
    anio: number;
    totalMovimientos: number;
    lastSyncAt: string | null;
    movements: TimelineEntry[];
    stats?: IExpedienteStats;
    stage?: ICaseStageResult;
    prediction?: IActivityPrediction;
    parties?: ICaratulaComponents | null;
    /** Marcado como favorito por el usuario autenticado (solo en listados). */
    isPinned?: boolean;
    /** Notas personales del usuario sobre este expediente. */
    notes?: string | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface IPaginatedResponse<T> {
    data: T[];
    meta: {
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
        totalPages: number;
        itemCount?: number;
    };
}

export type IPaginatedExpedientes = IPaginatedResponse<IExpediente>;

// ─── Query params ─────────────────────────────────────────────────────────────

export type ExpedienteOrderByField = 'lastSyncAt' | 'createdAt' | 'caratula' | 'iue';

export interface IExpedientesQuery {
    page?: number;
    limit?: number;
    search?: string;
    sede?: string;
    anio?: number;
    caratula?: string;
    status?: FollowStatus;
    orderBy?: ExpedienteOrderByField;
    order?: 'asc' | 'desc';
    onlyPinned?: boolean;
}
