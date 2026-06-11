import { config } from "@/lib/config";

// TRD §9 — IdentityProvider abstraction. The mock simulates SIM/eSIM identity;
// swapping in a real GSMA Open Gateway / CAMARA provider requires no UX change.
//
// Field → real API mapping (all mocked here, documented for the Level-2 swap):
//   verify()        → CAMARA Number Verification + Silent Network Authentication
//   simSwapSafe     → CAMARA SIM Swap API (no recent SIM change → not hijacked)
//   deviceBound     → CAMARA Device Status / KYC Match (line bound to this device)
//   confirmAction() → step-up re-auth via Number Verification at trust moments

export type SimType = "sim" | "esim";

export interface SecurityProfile {
  verified: boolean;
  carrier: string;
  simType: SimType;
  method: "sna" | "number-verify";
  deviceBound: boolean; // CAMARA Device Status / KYC Match
  simSwapSafe: boolean; // CAMARA SIM Swap — no recent swap detected
  identityId: string; // opaque, displayed masked (e.g. sid_••••7c2a)
  verifiedAt: number;
}

export interface StepUpResult {
  confirmed: boolean;
  token: string; // short-lived action token from the step-up re-auth
}

export interface IdentityProvider {
  /** onStep fires 1..3 as the carrier-side checks progress */
  verify(phone: string, onStep: (step: number) => void): Promise<SecurityProfile>;
  /** Step-up re-confirmation for a trust-sensitive action (e.g. a purchase) */
  confirmAction(purpose: string, amountKzt?: number): Promise<StepUpResult>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Deterministic opaque id from the phone — stable across a session, no real PII.
function deriveIdentityId(phone: string): string {
  let hash = 0;
  for (const ch of phone) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return "sid_" + hash.toString(16).padStart(8, "0").slice(-8);
}

// A verified user always has an identity. The persisted `security` profile can
// be absent (legacy users, or a stale tab clobbering it via cross-tab sync), so
// the UI derives a stable profile from the user as a fallback — same deterministic
// id, never a broken display.
export function securityFor(
  phone: string,
  carrier: string,
  stored?: SecurityProfile | null
): SecurityProfile {
  return (
    stored ?? {
      verified: true,
      carrier,
      simType: "esim",
      method: "sna",
      deviceBound: true,
      simSwapSafe: true,
      identityId: deriveIdentityId(phone || "+77010000000"),
      verifiedAt: 0,
    }
  );
}

export class MockSnaProvider implements IdentityProvider {
  constructor(private simType: SimType = "esim") {}

  async verify(phone: string, onStep: (step: number) => void): Promise<SecurityProfile> {
    onStep(1); // connecting to carrier network
    await delay(900);
    onStep(2); // cryptographic SIM/eSIM check (secure element)
    await delay(1100);
    onStep(3); // number confirmed
    await delay(600);
    return {
      verified: true,
      carrier: config.CARRIER_LABEL,
      simType: this.simType,
      method: "sna",
      deviceBound: true,
      simSwapSafe: true,
      identityId: deriveIdentityId(phone || "+77010000000"),
      verifiedAt: Date.now(),
    };
  }

  async confirmAction(_purpose: string, _amountKzt?: number): Promise<StepUpResult> {
    await delay(700); // carrier-side step-up re-auth
    return { confirmed: true, token: "act_" + Math.round(performance.now()).toString(36) };
  }
}

export const identityProvider: IdentityProvider = new MockSnaProvider("esim");
