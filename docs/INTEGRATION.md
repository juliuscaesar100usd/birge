# Интеграция парсера и SIM/eSIM поверх новой версии (Zigle)

Гайд для коллаборатора, который работал на старой версии сайта (Birge, до редизайна).

## Что изменилось в main

С момента старой версии в `main` добавились:

| Коммит | Что внутри |
|---|---|
| `90e931d` | AI-ассистент (`/assistant`, `src/app/api/assistant/`, `src/lib/assistant/`) |
| `9021309` | **Полный редизайн (Zigle)**: переписаны `globals.css`, все страницы в `src/app/`, почти все компоненты; новые маршруты `/catalog`, `/groups`, `/threshold/[id]`; ребрендинг Birge → Zigle |

**Важно:** бизнес-логика и движки сохранили API. `src/lib/engine/*`, `src/lib/store.ts`
(сигнатуры экшенов), типы в `src/lib/types.ts` и формат данных в `src/data/*` совместимы,
кроме перечисленного ниже.

## Как влить свою ветку

```bash
git fetch origin
git checkout <твоя-ветка>
git rebase origin/main        # или: git merge origin/main
```

Правила разруливания конфликтов:
- **UI-файлы** (`src/app/**/page.tsx`, `src/components/*`, `globals.css`) — бери версию из
  `main` (новый дизайн), свою логику переноси поверх отдельным коммитом.
- **Свой код** старайся держать в НОВЫХ файлах/папках (`src/lib/parser/`,
  `src/lib/engine/identity-real.ts`, `src/app/api/...`) — тогда конфликтов почти не будет.
- После rebase: `npm install && npm run build && npm run lint` — оба должны быть зелёными.
- В `main` пушим только через зелёный build. Лучше — веткой + PR.

## Куда подключать SIM/eSIM интеграцию

Точка подключения спроектирована заранее — UI менять не нужно (TRD §9 "swap path"):

1. Интерфейс: [`src/lib/engine/identity.ts`](../src/lib/engine/identity.ts)
   ```ts
   interface IdentityProvider {
     verify(phone: string, onStep: (step: number) => void): Promise<VerificationResult>;
   }
   ```
   Сейчас экспортируется `MockSnaProvider`.
2. Создай свой провайдер, например `src/lib/engine/identity-real.ts`
   (`OpenGatewayProvider implements IdentityProvider`) и переключи экспорт
   `identityProvider` (можно через env-флаг, напр. `NEXT_PUBLIC_USE_REAL_SNA=1`).
3. `onStep(1|2|3)` двигает анимацию на экране верификации
   (`src/app/onboarding/verify/page.tsx`): 1 — связь с оператором, 2 — проверка SIM,
   3 — подтверждение. Резолви promise с `{ verified, carrier, method }`.
4. Если нужен серверный код (секреты оператора) — добавь route handler
   `src/app/api/verify/route.ts` и вызывай его из своего провайдера. Секреты — только в
   `.env.local` / Vercel env, **не коммить**.
5. Название оператора на бейджах: `CARRIER_LABEL` в [`src/lib/config.ts`](../src/lib/config.ts).

## Куда подключать парсер каталога

1. Целевой формат — тип `Product` в [`src/lib/types.ts`](../src/lib/types.ts) и текущие
   данные в [`src/data/products.ts`](../src/data/products.ts). После редизайна добавились
   поля `rating`/`reviews` (проставляются автоматически в финальном `map`) и у категорий —
   `tint`/`ink`/`iconName` ([`src/data/categories.ts`](../src/data/categories.ts)).
2. Правила данных (Spec §2.3): цены — целые ₸; `priceTiers` строго убывают, первый tier
   `min=1, price=solo` (хелпер `makeTiers(solo)` уже есть в products.ts).
3. Маркетплейсы: [`src/data/marketplaces.ts`](../src/data/marketplaces.ts)
   (id/name/badgeColor/fx). Новые источники добавляй туда же.
4. Рекомендуемый путь для демо: парсер живёт отдельным скриптом (`scripts/parse.ts`) и
   генерирует `src/data/products.generated.ts` в формате `ProductSeed[]` — продукты
   остаются статикой, и демо работает офлайн (NFR-1). Если нужен рантайм — делай
   `src/app/api/catalog/route.ts`, но добавь фолбэк на статический каталог.
5. Лента/каталог/поиск подхватят данные автоматически: всё читается из
   `src/data/products.ts` через `scoreProducts` (`src/lib/engine/recommendations.ts`).

## Деплой

Прод задеплоен на Vercel из `main`. После того как твой код попал в `main`:

```bash
npx vercel --prod
```

(или попроси у владельца проекта доступ к Vercel-проекту). Переменные окружения
(`GOOGLE_GENERATIVE_AI_API_KEY` для AI-ассистента, твои ключи оператора) добавляются через
`npx vercel env add <NAME> production` — не через коммит.
