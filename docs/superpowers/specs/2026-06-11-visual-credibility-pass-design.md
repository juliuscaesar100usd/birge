# Visual Credibility Pass — Design

**Date:** 2026-06-11
**Goal:** Maximize pitch credibility for tonight's hackathon demo with safe, high-impact visual polish. No changes to business logic, group state machine, i18n, or onboarding flow.

## Context

Walkthrough of the running app (mobile viewport, full demo flow) found the demo
mechanically solid — group join, tier ladder, countdown, cross-tab realtime all work.
The credibility gaps are visual:

1. Product "photos" are emoji on gradient backgrounds (💇‍♀️ on pink).
2. Every product card shows the same **−34%** badge — `makeTiers()` in
   `src/data/products.ts` applies one fixed formula to all non-hero products,
   so the data reads as obviously fake.
3. Toasts render over the screen title (e.g. over «Групповая покупка»).
4. Splash uses 📶 for "Без паролей" — reads as signal bars, not SIM identity.

## Changes

### 1. Real product photos

- One license-free photo per product (26), downloaded once to
  `public/products/<id>.jpg` (~800 px wide, JPEG). Local files keep the demo
  fully offline-capable (NFR-1) — no API keys, no network at pitch time.
- Add optional `image?: string` to `Product` type.
- `ProductImage` renders the photo `object-cover`; the existing emoji+gradient
  stays as automatic fallback if a file is missing or fails to load — the demo
  can never show a broken image. Gradient remains the loading background.

### 2. Varied discount ladders

- Replace single-formula `makeTiers(solo)` with deterministic per-product
  variation seeded from the product id (no runtime randomness).
- Max discount varies **−30%…−40%**: badges differ card-to-card, but every
  product still hits ≥30% at full group, so BO-2 ("group buying saves 30%+")
  stays true everywhere.
- Hero product (`prd_01`) keeps its hand-tuned ladder — demo script numbers
  (15 000 → 10 900 → 9 900 ₸) are untouched.
- Tiers remain strictly decreasing, rounded to 100 ₸ (Spec §2.3).

### 3. Toast positioning

Offset `ToastHost` below the header zone so toasts no longer cover screen titles.

### 4. Splash icon

📶 → 🪪 on the "Без паролей" feature row.

## Verification

- `npm run build` passes.
- Full Playwright run of the 9-step demo script: splash → onboarding → feed →
  hero product → group join/lock at 5/5 → invite sheet → checkout with
  `WELCOME5` → order → profile.
- Two-tab realtime check (BroadcastChannel propagation).

## Out of scope (tonight)

Store refactor, tests, accessibility pass, new features, backend swap.
