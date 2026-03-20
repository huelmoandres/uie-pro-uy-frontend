import { getReferralCode, applyReferralCode } from "@api/referrals.api";

export class ReferralService {
  static readonly queryKeys = {
    code: () => ["referral", "code"] as const,
  };

  static getReferralCode = getReferralCode;
  static applyReferralCode = applyReferralCode;
}
