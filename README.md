# Birge — покупаем вместе, дешевле

Hackathon MVP: a mobile-first collective-buying marketplace aggregator for Kazakhstan.
One localized feed across AliExpress / Temu / Wildberries / Ozon (mocked), prices in ₸,
RU/KZ/EN, Pinduoduo-style group buying with tiered prices, and passwordless SIM/eSIM
identity (simulated Silent Network Authentication).

Implements BRD/PRD/TRD/Spec v1.0. Fully offline-capable: all data is mocked client-side
(NFR-1) — no backend, no API keys, nothing to break during the pitch.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Open in a phone-sized viewport (or just resize — the app renders inside a phone frame
on desktop). `npm run build && npm start` for production.

## Demo script (~2 minutes)

1. **Splash → phone entry** — enter any 10-digit number (e.g. `707 123 45 67`).
2. **SIM verification** — animated Silent Network Authentication, no password, no OTP.
   Ends with the persistent **"Verified by Kcell"** badge.
3. **Interests → budget → city → likes** — pick Электроника + Спорт, mid budget, Almaty.
4. **Feed** — 26 products from 4 marketplaces, ranked by your interests, each with a
   "recommended because…" line. Toggle **РУ/ҚЗ/EN** live. Search and category chips work.
5. **Hero product** (Беспроводные наушники, first card) — solo 15 000 ₸ vs group
   9 900 ₸, tier ladder, and an open group at **4/5**.
6. **Join the group** → it locks at 5/5: confetti, price drops to **10 900 ₸**,
   savings −4 100 ₸. *(This is the money shot.)*
7. **Invite sheet** — Telegram / WhatsApp / copy link / QR. After sharing, the next
   joiner is credited as your referral → +500 ₸ coupon.
8. **Checkout** — savings highlighted, VAT 12%, delivery; apply coupon `WELCOME5`
   → total **12 698 ₸**. Simulated payment → confetti → order in history.
9. **Profile** — verified badge, total saved, orders, coupons, referrals, editable
   preferences (feed re-ranks live).

**Live "second device":** open the same group URL in a second browser tab — joins and
price drops propagate between tabs in real time (BroadcastChannel standing in for
Supabase Realtime).

**Demo determinism:** while a group screen is open, simulated participants join every
~6 s — but they never deliver the locking join unless you are a member. The pre-seeded
4/5 group always waits for *your* join to complete.

## Architecture (maps to TRD)

```
src/
  app/                      15 screens (S1–S15 from the PRD), App Router
  components/               ProductCard, TierLadder, GroupProgressBar, Countdown,
                            InviteSheet, ToastHost, VerifiedBadge, …
  lib/
    config.ts               MOCK_MODE, GROUP_FAIL_POLICY, DEMO_AUTO_JOIN, USE_LLM_RECS
    store.ts                Zustand + localStorage persistence (the mock "backend")
    engine/groups.ts        group state machine: OPEN → LOCKED → COMPLETED / FAILED
    engine/recommendations  Spec §5 weights: category .40 budget .25 location .15
                            popularity .15 taste .05 + explainability reasons
    engine/identity.ts      IdentityProvider interface + MockSnaProvider — swaps to a
                            real GSMA Open Gateway / CAMARA provider with no UX change
    i18n/                   RU (default) / KK / EN bundles, live switching
    sync.ts                 BroadcastChannel cross-tab realtime
    analytics.ts            PRD §8 events → console + localStorage
  data/                     4 marketplaces, 8 categories, 26 products with price
                            tiers, KZ cities, simulated participant pool
```

Level-2 swap path (TRD §9): replace `MockSnaProvider` with an Open Gateway provider and
the Zustand mock layer with Supabase (same contracts) — the UX does not change.

## Config flags (`src/lib/config.ts`)

| Flag | Default | Meaning |
|---|---|---|
| `GROUP_FAIL_POLICY` | `auto_extend` | or `cancel_refund` — deadline behavior below min |
| `DEMO_AUTO_JOIN` | `true` | simulated participants while a group screen is open |
| `GROUP_WINDOW_MS` | 40 min | demo-compressed group window (real: 24 h) |
| `USE_LLM_RECS` | `false` | deterministic rules only (Spec §5 fallback) |

Reset the demo any time: Profile → «Сбросить демо».
