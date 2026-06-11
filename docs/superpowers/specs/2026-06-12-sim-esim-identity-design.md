# SIM/eSIM Identity Layer — Design & Implementation Plan

**Date:** 2026-06-12
**Goal:** Make SIM/eSIM identity a legible, credible, product-integrated concept for
the hackathon, per the ТЗ. No real telecom — the spec explicitly forbids physical
SIM/eSIM implementation and scores *understanding the role* of the identity layer.

## What the ТЗ requires (and doesn't)

- «SIM-подложка или eSIM… **не разрабатываются физически**. Они должны быть отражены
  как **концептуальный модуль безопасной идентификации**.»
- Judging criterion: «**Понимание роли SIM/eSIM как слоя идентификации**.»
- Positioning: Level 1 (MVP) = group buying + aggregation + recommendations.
  SIM/eSIM = **Level 2 strategic vision** (telecom integration, secure commerce).
- Checklist item already met today: «пользователь подтверждён через SIM/eSIM ID».

So the work is **depth + integration + a presentable architecture**, not a real eSIM.

## Current state (already built)

- `IdentityProvider` interface + `MockSnaProvider` (`src/lib/engine/identity.ts`)
- S3 verify screen: 3-step animated carrier check → "Verified by Kcell" badge
- S4 explainer: SNA, SIM-swap protection, GSMA Open Gateway
- Passwordless phone onboarding; `completeVerification()` sets `isVerified`/`carrierLabel`

Gap: identity appears once at signup, then vanishes. It is not connected to the
core mechanic, and there is no architecture artifact a judge can read.

## The core narrative (the differentiator)

Collective pricing only works if the N participants are **real, unique humans**.
Without strong identity, one person spins up 5 accounts (or bots flood a group) and
the wholesale economics break. **SIM/eSIM identity = 1 verified human = 1 seat** —
it is the anti-fraud foundation that makes group-buying viable, not a login skin.
This reframes SIM/eSIM from "nice login" to "load-bearing trust layer."

## Architecture: the identity spine

Extend the provider so its shape mirrors real **GSMA Open Gateway / CAMARA** APIs
(documented in code comments, mock implementation):

```
SecurityProfile {
  simType:    "sim" | "esim"     // eSIM in demo → modern device-bound angle
  carrier:    string
  method:     "sna" | "number-verify"
  deviceBound: boolean           // ← CAMARA Device Status / KYC Match
  simSwapSafe: boolean           // ← CAMARA SIM Swap API (no recent swap)
  identityId: string             // opaque, shown masked: "sid_••••7c2a"
  verifiedAt: number
}
```

Provider methods (mock, deterministic):
- `verify(phone, onStep)` → `SecurityProfile`  ⟶ CAMARA **Number Verification** + SNA
- `confirmAction(purpose, amountKzt)` → `{ confirmed, token }` ⟶ step-up re-auth

`MockSnaProvider` returns an eSIM profile; a `lineType`-style flag keeps SIM vs eSIM
visible. Swap path unchanged: replace the mock class with an Open Gateway client,
same interface, zero UX change (TRD §9).

Store: add a persisted `security: SecurityProfile | null`, set in
`completeVerification()`, cleared in `resetAll()`.

## Touchpoints (where identity shows up in the product)

1. **Checkout step-up (S13).** Above the pay button: a SIM/eSIM confirmation control —
   "Подтвердите покупку через SIM" → tap → ~700 ms → ✓ "Подтверждено · sid_••••7c2a".
   Pay stays enabled (demo-safe) but reads as identity-gated. Tracks `identity_step_up`.
2. **Group trust strip (S10).** Shield + "Только подтверждённые участники · 1 SIM = 1 место";
   member avatars get a small verified check. This is the anti-fraud narrative, on screen.
3. **Profile security panel (S15).** Card under the identity card: device-bound · eSIM ID
   (masked) · SIM-swap protection active · method. "Подробнее →" opens the identity screen.
4. **Identity / architecture screen (new `/identity`).** The deck-ready artifact: layered
   trust diagram (secure element → carrier network → Open Gateway/CAMARA → Birge),
   what's real vs mocked, and the Level-1→Level-2 swap path. Reachable from the security
   panel and the S4 explainer.

## File-level change list

- `src/lib/engine/identity.ts` — extend result → `SecurityProfile`; add `confirmAction`;
  add `MockEsimProvider` flavor; map every field to a named GSMA/CAMARA API in comments.
- `src/lib/types.ts` — add `SecurityProfile`; optional `security` on store state (or a slice).
- `src/lib/store.ts` — store `security` on `completeVerification`; clear on `resetAll`.
- `src/app/onboarding/verify/page.tsx` — consume richer result; surface eSIM wording.
- `src/app/checkout/page.tsx` — step-up confirmation control + state.
- `src/app/group/[id]/page.tsx` — verified-participants trust strip + member check marks.
- `src/app/profile/page.tsx` — security panel card.
- `src/app/identity/page.tsx` — new architecture/trust screen.
- `src/lib/i18n/dictionaries.ts` — new keys in ru / kk / en.
- `src/lib/analytics.ts` — `identity_step_up` (+ `identity_panel_viewed`).
- `README.md` + `docs/` — architecture section and a slide-ready identity diagram.

## Out of scope

Real eSIM provisioning, real Open Gateway/CAMARA calls, carrier contracts, payment auth,
SMS/OTP. All remain mocked behind the existing `IdentityProvider` seam.

## Verification

- `npm run build` passes.
- Browser walk: onboarding → verify (eSIM wording) → feed → product → group (trust strip
  + member checks) → checkout (step-up confirm) → order → profile (security panel) →
  identity screen. Demo reset clears `security`.
