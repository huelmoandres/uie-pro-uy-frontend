/**
 * Interfaces that mirror the backend DTOs (ExpedienteResponseDto, MovementDto, DecreeDto).
 * Single source of truth for all expediente-related types in the app.
 */

// ─── Enum ────────────────────────────────────────────────────────────────────

export enum FollowStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
}

// ─── Models ──────────────────────────────────────────────────────────────────

export interface IDecree {
    /** Texto del decreto judicial. Null si está reservado. */
    textoDecreto: string | null;
    /** Indica si el decreto está marcado como reservado. */
    isReserved: boolean;
    /** Número de decreto del SOAP (ej: "445/2026"). */
    nroDecreto: string | null;
}

export interface IMovement {
    /** Fecha del movimiento (ISO string). */
    fecha: string;
    /** Tipo de movimiento (ej: "DECRETO"). */
    tipo: string;
    /** Sede donde se generó el movimiento. */
    sede: string;
    /** Número de orden dentro del expediente. */
    orden: number | null;
    /** Decreto asociado. Null si no aplica. */
    decree: IDecree | null;
}

export interface IExpediente {
    /** Identificador Único del Expediente. Formato: Sede-NroRegistro/Año. */
    iue: string;
    /** Carátula oficial del expediente. */
    caratula: string | null;
    /** Sede judicial donde tramita. */
    sede: string;
    /** Número de registro. */
    nroRegistro: number;
    /** Año del expediente. */
    anio: number;
    /** Total de movimientos registrados. */
    totalMovimientos: number;
    /** Fecha y hora de la última sincronización. */
    lastSyncAt: string | null;
    /** Lista de movimientos del expediente. */
    movements: IMovement[];
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
}
