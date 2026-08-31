# Peoples Credit Union · Indirect Onboarding

Proof-of-concept for Peoples Credit Union to welcome indirect auto loan members into debt
protection — consultant desk (queue, script, Call or Send link) plus member self-serve
(leftover → Add → Enroll). Polish and a client-ready, on-brand experience matter more than
backend completeness.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS v3 · React Router v6 · Recharts · lucide-react.

## Commands
```bash
npm run dev    # dev server on http://localhost:5173
npm run build  # tsc -b + vite build (run before claiming a change compiles)
```

## Layout
```
src/
  brand/brands.ts   # Peoples palette, fonts, logo, copy, branches, area codes, viz colors
  brand/index.ts    # applyBrand() (CSS vars) + activeBrand export
  data/mock.ts      # origination-stage seeded data (Peoples branches, officers, opportunities, claims)
  data/book.ts      # post-origination book-of-business + opportunity-scoring model (Outreach tab)
  lib/metrics.ts    # aggregations off mock.ts
  lib/format.ts     # usd / num / pct / etc. formatters
  components/       # Layout (sidebar + topbar), ui.tsx primitives, CallWizard.tsx
  pages/            # Project, Self-serve, Overview, Opportunities, Outreach, Production, Members, Claims, Team
```

## Conventions
- **All data is deterministic mock data** (seeded PRNG in `data/mock.ts` + `data/book.ts`).
- **Brand palette**: `tailwind.config.js` exposes `ca.*`, `ink.*`, and `accent.*` via CSS
  variables set by `applyBrand()`. Use these tokens, not raw hex. Chart/inline colors from
  `import { viz } from "../brand"`. Headings use `font-slab` (`--font-display`); body is
  Montserrat. Positive states use Tailwind `emerald.*`.
- **Coverages**: Life (death), Disability, Involuntary Unemployment (IUI).
- **Overlays must use `createPortal(..., document.body)`** — see `CallWizard.tsx` and
  drawers in `Members.tsx` / `Claims.tsx`.
- Reusable UI in `src/components/ui.tsx` — prefer these over re-rolling markup.

## Verifying changes
A change is "done" only after `npm run build` passes and the screen is checked in the browser.
