// Demo/environment flags per TRD §14. All external systems are mocked (MOCK_MODE).
export const config = {
  MOCK_MODE: true,
  // What happens when the deadline passes below min participants (Spec §2.4)
  GROUP_FAIL_POLICY: "auto_extend" as "auto_extend" | "cancel_refund",
  // Simulated participants join while the group screen is open (TRD §7.3)
  DEMO_AUTO_JOIN: true,
  DEMO_AUTO_JOIN_INTERVAL_MS: 6000,
  USE_LLM_RECS: false,
  DEMO_FALLBACK_OTP: false,
  CARRIER_LABEL: "Kcell",
  // Group window compressed for the demo (real default: 24h)
  GROUP_WINDOW_MS: 40 * 60 * 1000,
  EXTEND_MS: 30 * 60 * 1000,
  VAT_RATE: 0.12,
  NEW_GROUP_MIN: 5,
  NEW_GROUP_TARGET: 10,
  REFERRAL_REWARD_KZT: 500,
  WELCOME_COUPON_KZT: 500,
  // AI assistant models: Gemini free tier when a key is set, keyless free API otherwise;
  // the deterministic mock (client-side) is the final fallback per NFR-1
  ASSISTANT_GEMINI_MODEL: "gemini-3.5-flash",
  ASSISTANT_FREE_MODEL: "openai",
};
