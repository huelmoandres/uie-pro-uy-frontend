/**
 * Tag interfaces mirroring the backend TagResponseDto and related DTOs.
 */

export interface ITag {
    id: string;
    name: string;
    /** Color hex para la UI (ej: "#ef4444") */
    color: string;
    createdAt: string;
}

export interface ICreateTagPayload {
    name: string;
    color?: string;
}

export interface IUpdateTagPayload {
    name?: string;
    color?: string;
}
