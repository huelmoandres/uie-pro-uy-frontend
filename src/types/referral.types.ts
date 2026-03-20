import { z } from "zod";
import { referralCodeSchema } from "@schemas/referral.schema";

/** Respuesta del endpoint GET /users/me/referral-code */
export interface IReferralCodeResponse {
  code: string;
}

/** Tipo del formulario de aplicar código (pre-transform, lo que escribe el usuario). */
export type ReferralCodeForm = z.input<typeof referralCodeSchema>;
