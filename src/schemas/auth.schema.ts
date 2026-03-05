import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string("Campo requerido")
        .min(1, 'El correo electrónico es obligatorio')
        .email('Ingresá un correo electrónico válido'),
    password: z
        .string("Campo requerido")
        .min(1, 'La contraseña es obligatoria')
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const registerSchema = z
    .object({
        name: z
            .string("Campo requerido")
            .min(1, 'El nombre es obligatorio')
            .min(2, 'El nombre debe tener al menos 2 caracteres'),
        email: z
            .string("Campo requerido")
            .min(1, 'El correo electrónico es obligatorio')
            .email('Ingresá un correo electrónico válido'),
        phone: z
            .string()
            .regex(/^[0-9]*$/, 'Solo se permiten números')
            .optional(),
        cedula: z
            .string()
            .regex(/^[0-9]*$/, 'Solo se permiten números')
            .optional(),
        password: z
            .string("Campo requerido")
            .min(1, 'La contraseña es obligatoria')
            .min(8, 'La contraseña debe tener al menos 8 caracteres'),
        confirmPassword: z
            .string()
            .min(1, 'Confirmar la contraseña es obligatorio'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

export const updateProfileSchema = z.object({
    name: z
        .string("Campo requerido")
        .min(1, 'El nombre es obligatorio')
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
    phone: z
        .string()
        .regex(/^[0-9]*$/, 'Solo se permiten números')
        .optional(),
    cedula: z
        .string()
        .regex(/^[0-9]*$/, 'Solo se permiten números')
        .optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// ─── Expediente Schema ─────────────────────────────────────────────────────

/**
 * IUE format: digits, dashes and slashes only (e.g. 40-91/2018)
 * Regex: one or more digits, optional dash/digits segment, a slash, then the year.
 */
export const followExpedienteSchema = z.object({
    iue: z
        .string()
        .min(1, 'El número de expediente es obligatorio')
        .regex(
            /^\d+(-\d+)?\/\d{4}$/,
            'Formato inválido. Usá el formato correcto: 40-91/2018'
        ),
});

export type FollowExpedienteFormData = z.infer<typeof followExpedienteSchema>;
