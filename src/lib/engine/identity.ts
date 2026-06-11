import { config } from "@/lib/config";

// TRD §9: IdentityProvider abstraction. The mock simulates Silent Network
// Authentication; swapping in a real GSMA Open Gateway / CAMARA Number
// Verification provider requires no UX change — same interface.
export interface VerificationResult {
  verified: boolean;
  carrier: string;
  method: string;
}

export interface IdentityProvider {
  /** onStep fires 1..steps as the carrier-side checks progress */
  verify(phone: string, onStep: (step: number) => void): Promise<VerificationResult>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockSnaProvider implements IdentityProvider {
  async verify(_phone: string, onStep: (step: number) => void): Promise<VerificationResult> {
    onStep(1); // connecting to carrier network
    await delay(900);
    onStep(2); // cryptographic SIM check
    await delay(1100);
    onStep(3); // number confirmed
    await delay(600);
    return { verified: true, carrier: config.CARRIER_LABEL, method: "SNA-sim" };
  }
}

export const identityProvider: IdentityProvider = new MockSnaProvider();
