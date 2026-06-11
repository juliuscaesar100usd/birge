# Zigle — покупай вместе, дешевле

Hackathon MVP: a mobile collective-buying marketplace aggregator for Kazakhstan, rendered inside
an iPhone-style frame. One localized feed across AliExpress / Temu / Wildberries / Ozon (mocked),
prices in ₸, RU/KZ/EN, Pinduoduo-style group buying with tiered prices, passwordless SIM/eSIM
identity (simulated Silent Network Authentication, Beeline KZ), and an AI shopping assistant.

Implements BRD/PRD/TRD/Spec v1.0 + the Zigle visual design system (blue/coral/yellow on Golos
Text). Fully offline-capable: all commerce data is mocked client-side (NFR-1) — nothing to break
during the pitch.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

The app renders in a fixed 402×872 phone frame auto-scaled to the viewport — open it on any
screen. `npm run build && npm start` for production.

## Demo script (~2 minutes)

1. **Splash → phone entry** — custom keypad, number prefilled (`701 123 45 67`).
2. **SIM verification** — Silent Network Authentication animation on the carrier network,
   "Подтверждено · Beeline KZ". No password, no OTP.
3. **Zigle ID explainer → interests → budget → city → likes.**
4. **Feed** — blue Zigle header, promo carousel, and the **coral hot-group card**: hero group at
   **4 из 5**, countdown ticking. Toggle **Рус/Қаз/Eng** live.
5. **Tap the hot group** → group screen: live price, member avatars + one dashed slot,
   "Нужно ещё 1", tier ladder with «вы здесь».
6. **Войти в группу** → 5/5 → **threshold screen**: green gradient, confetti,
   Было 15 000 ₸ → Стало **10 900 ₸** (−27%).
7. **Checkout** — qty stepper, promo chips (`BIRGE500` −500 ₸ demo code or your `WELCOME5`
   coupon), Kaspi pay row → total **12 698 ₸** → confirmation with the green savings hero.
8. **Groups tab** — active groups with progress; **Catalog tab** — category-filtered grid.
9. **AI tab** — the assistant answers about products, groups, delivery, VAT and orders in the
   active language, with tappable product cards.

**Demo helpers:** every "Купить в группе" opens a group pre-seeded at min−1 — your join always
completes it; the dashed «Симулировать вход (демо)» button adds members manually; simulated
participants also trickle in while a group screen is open (never delivering the locking join
unless you are a member). A second browser tab acts as the "second device" — joins propagate
live via BroadcastChannel.

## AI assistant (AI tab)

Context-aware: knows the catalog, your profile, groups and orders; replies in RU/KZ/EN.
**Free-model chain** (header chip shows the active level):

1. **Gemini** — set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` (free key from
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) → best free-tier model.
2. **Free AI** — keyless OpenAI-compatible endpoint (`text.pollinations.ai`), zero setup.
3. **Demo mode** — offline/rate-limited → deterministic local assistant reusing the
   recommendation engine. The pitch never breaks.

## Architecture (maps to TRD)

```
src/
  app/                      18 routes: S1–S16 + /catalog + /groups + /threshold/[id]
  components/               ZigleLogo, Icon set, ProductCard, TierLadder, HotGroupCard,
                            BannerCarousel, GroupProgressBar, InviteSheet, Countdown, …
  lib/
    config.ts               MOCK_MODE, GROUP_FAIL_POLICY, DEMO_AUTO_JOIN, carrier, models
    store.ts                Zustand + localStorage persistence (the mock "backend")
    engine/groups.ts        state machine OPEN → LOCKED → COMPLETED / FAILED (Spec §4)
    engine/recommendations  Spec §5 weights + explainability reasons
    engine/identity.ts      IdentityProvider interface + MockSnaProvider — swaps to a real
                            GSMA Open Gateway / CAMARA provider with no UX change
    assistant/              AI system prompt + offline mock fallback
    i18n/                   RU (default) / KK / EN bundles, live switching
    sync.ts                 BroadcastChannel cross-tab realtime
  data/                     4 marketplaces, 8 categories, 26 products with price tiers,
                            ratings/reviews, KZ cities, simulated participant pool
```

Level-2 swap path (TRD §9): replace `MockSnaProvider` with an Open Gateway provider and the
Zustand mock layer with Supabase (same contracts) — the UX does not change.

Reset the demo any time: Профиль → «Сбросить демо».
