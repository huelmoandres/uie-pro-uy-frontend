import { apiClient } from "./client";
import type { IReferralCodeResponse } from "@app-types/referral.types";

export async function getReferralCode(): Promise<IReferralCodeResponse> {
  const { data } = await apiClient.get<IReferralCodeResponse>("/users/me/referral-code");
  return data;
}

export async function applyReferralCode(code: string): Promise<void> {
  await apiClient.post("/users/me/apply-referral", { code: code.toUpperCase() });
}
