# Peoples Credit Union · Indirect Onboarding

A branded proof-of-concept for **Peoples Credit Union** to onboard indirect auto loan
members into debt protection — a consultant welcome desk plus a member self-serve path when
nobody picks up. Built as a founding-partner ask: works alongside existing ASG GAP/VSC at
the dealer and whatever debt protection carrier Peoples already uses.

> Proof of concept with deterministic mock data. Not connected to the core.

## About Peoples Credit Union

- **Headquarters:** Webster City, Iowa
- **Founded:** 1936
- **Mission:** *People Helping People*
- **Branches:** Central Iowa (Webster City, Fort Dodge, Ames, Boone, and more)
- **Charter:** Iowa state-chartered, federally insured by **NCUA**

## Screens

| Route | Purpose | Built for |
|-------|---------|-----------|
| `/` or `/project` **Project** | Founding-partner ask — what this is, what we need, what you get, timeline | Meeting room |
| `/self-serve` **Self-serve** | Member phone walk — leftover → Add → Enroll (demo member, not the CU book) | Member preview |
| `/overview` **Overview** | Executive KPIs, penetration vs. goal, enrollment trend, coverage mix, funnel, claims snapshot | Leadership |
| `/opportunities` | Conversion funnel and action queue of eligible loans not yet offered | MSRs / lenders |
| `/outreach` | Post-origination book: ranked protection gaps + guided call wizard | Welcome / call team |
| `/production` | Recurring fee income vs. target, production by branch | Leadership / finance |
| `/members` | Searchable member & loan table with detail drawer | Frontline & servicing |
| `/claims` | Kanban claims lifecycle with detail drawer & timeline | Claims / admin |
| `/team` | Officer leaderboard with goal attainment | Leadership / coaching |

## Coverages modeled

Standard debt protection bundle: **Life (death)**, **Disability**, and **Involuntary
Unemployment (IUI)**.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle to dist/
```

## Tech

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Recharts · lucide-react.

## Branding

Palette, fonts, logo, and mock branch/market data are defined in `src/brand/brands.ts`.
Peoples burgundy `#96262C`, maroon chrome `#4C0418`, gold accent `#D69746`, Montserrat
throughout. Chart colors come from the brand `viz` palette via `import { viz } from "../brand"`.
