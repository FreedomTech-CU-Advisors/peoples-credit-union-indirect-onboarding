/**
 * Book-of-business dataset for the post-origination Outreach tab.
 *
 * These are EXISTING loans already on the books (think: nightly feed from the core /
 * loan-origination system) where the member has no debt protection, or only partial
 * coverage. Each loan is scored so loan consultants can work the highest-value
 * opportunities first.
 *
 * Opportunity Score (0–100) blends:
 *   - Protection gap (no coverage scores highest)
 *   - Balance exposure (more at risk = more value to protect)
 *   - Remaining term (more payments left = more months of fee income + member value)
 *   - Risk / life-event signals (seasonal income, new dependent, recent hardship…)
 *   - Recency & relationship (recently booked, long-tenured, multi-product members)
 */

import { activeBrand } from "../brand";
import {
  BRANCHES,
  COVERAGES,
  OFFICERS,
  type CoverageKey,
  type LoanType,
} from "./mock";

// independent seed so this list is stable but distinct from origination data
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(776541);
const rand = () => rng();
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;

const FIRST = [
  "Robert", "Maria", "James", "Linda", "David", "Patricia", "Angela", "Kevin",
  "Sandra", "Brian", "Nicole", "Carlos", "Theresa", "Derrick", "Yolanda", "Wesley",
  "Gloria", "Travis", "Bianca", "Stephen", "Denise", "Andre", "Rachel", "Vincent",
  "Tonya", "Gregory", "Latoya", "Curtis", "Bridget", "Marcus", "Felicia", "Damon",
];
const LAST = [
  "Bennett", "Hoffman", "Vega", "Calderon", "Whitfield", "Sandoval", "Brennan",
  "Mcdaniel", "Schroeder", "Aguilar", "Donovan", "Pittman", "Mccarthy", "Solis",
  "Lindgren", "Fairchild", "Becker", "Ortega", "Hammond", "Vaughn", "Sweeney",
];
const fullName = () => `${pick(FIRST)} ${pick(LAST)}`;

const LOAN_TYPES: LoanType[] = ["Auto", "Personal", "Credit Card", "HELOC", "Mortgage", "RV / Boat"];
const loanRange: Record<LoanType, [number, number]> = {
  Auto: [12000, 48000],
  Personal: [3000, 25000],
  "Credit Card": [1500, 18000],
  HELOC: [20000, 90000],
  Mortgage: [120000, 420000],
  "RV / Boat": [25000, 110000],
};
const termByType: Record<LoanType, number> = {
  Auto: 72,
  Personal: 60,
  "Credit Card": 60,
  HELOC: 120,
  Mortgage: 360,
  "RV / Boat": 144,
};

export type SignalKind = "gap" | "risk" | "life" | "value";
export interface Signal {
  label: string;
  detail: string;
  kind: SignalKind;
  weight: number;
}

export type Tier = "Hot" | "Warm" | "Cool";

export interface BookLoan {
  id: string;
  memberName: string;
  memberId: string;
  phone: string;
  loanType: LoanType;
  originalAmount: number;
  currentBalance: number;
  rate: number;
  monthlyPayment: number;
  originatedMonthsAgo: number;
  termMonths: number;
  remainingMonths: number;
  currentCoverages: CoverageKey[];
  recommendedCoverages: CoverageKey[];
  estMonthlyPremium: number;
  signals: Signal[];
  score: number;
  tier: Tier;
  bestCallWindow: string;
  branchId: string;
  officerId: string;
  memberSinceYears: number;
  products: number; // other CU products held
  lastContactDaysAgo: number | null;
}

const CALL_WINDOWS = [
  "Weekdays 5–7 PM",
  "Weekday mornings",
  "Lunch hour (12–1 PM)",
  "Saturday mornings",
  "Weekday afternoons",
];

export function premiumFor(coverages: CoverageKey[], balance: number): number {
  const perK = 0.55 + coverages.length * 0.22;
  return Math.round((balance / 1000) * perK * 100) / 100;
}

// Area codes for the active brand's market (e.g. 303/720/970 Colorado, 816/913 KC
// metro, 316/620/785 Kansas).
const phone = () => `(${pick(activeBrand.areaCodes)}) 555-${randInt(1000, 9999)}`;

function buildLoan(i: number): BookLoan {
  const loanType = pick(LOAN_TYPES);
  const [lo, hi] = loanRange[loanType];
  const originalAmount = randInt(lo / 100, hi / 100) * 100;
  const termMonths = termByType[loanType];
  const originatedMonthsAgo = randInt(1, Math.min(termMonths - 6, 96));
  const remainingMonths = Math.max(6, termMonths - originatedMonthsAgo);
  const paidRatio = originatedMonthsAgo / termMonths;
  const currentBalance = Math.round((originalAmount * (1 - paidRatio * 0.92)) / 100) * 100;
  const rate = Math.round((4 + rand() * 9) * 100) / 100;
  const monthlyPayment = Math.round(
    (originalAmount * (rate / 1200)) / (1 - Math.pow(1 + rate / 1200, -termMonths))
  );

  // current coverage: most have none, some partial (life only)
  const currentCoverages: CoverageKey[] = [];
  const coverRoll = rand();
  if (coverRoll > 0.78) currentCoverages.push("life"); // partial — life only
  if (coverRoll > 0.94) currentCoverages.push("disability");

  const allKeys: CoverageKey[] = COVERAGES.map((c) => c.key);
  const recommendedCoverages = allKeys.filter((k) => !currentCoverages.includes(k));
  const estMonthlyPremium = premiumFor(recommendedCoverages, currentBalance);

  const branch = pick(BRANCHES);
  const officer = pick(OFFICERS.filter((o) => o.branchId === branch.id));
  const memberSinceYears = randInt(1, 22);
  const products = randInt(1, 5);
  const lastContactDaysAgo = chance(0.45) ? randInt(20, 400) : null;

  // ---- signals + scoring ----
  const signals: Signal[] = [];

  // Protection gap
  if (currentCoverages.length === 0) {
    signals.push({
      kind: "gap",
      weight: 30,
      label: "No protection on active loan",
      detail: `${loanType} loan has zero debt protection coverage.`,
    });
  } else {
    signals.push({
      kind: "gap",
      weight: 16,
      label: "Partial coverage — gaps remain",
      detail: `Has ${currentCoverages.length} of 3 coverages; disability/unemployment exposed.`,
    });
  }

  // Balance exposure
  if (currentBalance > 30000) {
    signals.push({
      kind: "value",
      weight: 18,
      label: "High balance exposure",
      detail: `$${currentBalance.toLocaleString()} outstanding would burden family on a covered event.`,
    });
  } else if (currentBalance > 12000) {
    signals.push({
      kind: "value",
      weight: 10,
      label: "Meaningful balance",
      detail: `$${currentBalance.toLocaleString()} outstanding balance.`,
    });
  }

  // Remaining term
  if (remainingMonths >= 48) {
    signals.push({
      kind: "value",
      weight: 12,
      label: "Long runway remaining",
      detail: `${remainingMonths} payments left — years of exposure to protect.`,
    });
  }

  // Recency
  if (originatedMonthsAgo <= 4) {
    signals.push({
      kind: "value",
      weight: 14,
      label: "Recently originated",
      detail: `Booked ${originatedMonthsAgo} month(s) ago — coverage can still be added easily.`,
    });
  }

  // Risk signals (random-ish but deterministic)
  if (chance(0.34)) {
    signals.push({
      kind: "risk",
      weight: 16,
      label: "Seasonal / variable income",
      detail: "Deposit pattern suggests irregular income — unemployment coverage is relevant.",
    });
  }
  if (chance(0.18)) {
    signals.push({
      kind: "risk",
      weight: 14,
      label: "Recent payment hardship",
      detail: "One late payment in the last 12 months — member is risk-aware.",
    });
  }

  // Life-event signals
  if (chance(0.22)) {
    signals.push({
      kind: "life",
      weight: 15,
      label: "New dependent on file",
      detail: "Recently added a beneficiary/dependent — life coverage resonates.",
    });
  }
  if (chance(0.16)) {
    signals.push({
      kind: "life",
      weight: 8,
      label: "Recent address change",
      detail: "Possible household/life change — good moment to review protection.",
    });
  }

  // Relationship value
  if (memberSinceYears >= 10) {
    signals.push({
      kind: "value",
      weight: 6,
      label: "Long-tenured member",
      detail: `${memberSinceYears}-year member — high trust, strong save opportunity.`,
    });
  }

  let score = signals.reduce((s, x) => s + x.weight, 0);
  // small jitter + clamp
  score = Math.min(99, Math.max(28, Math.round(score + randInt(-4, 6))));
  const tier: Tier = score >= 75 ? "Hot" : score >= 55 ? "Warm" : "Cool";

  return {
    id: `BOO-${(40500 + i).toString()}`,
    memberName: fullName(),
    memberId: `M${randInt(100000, 999999)}`,
    phone: phone(),
    loanType,
    originalAmount,
    currentBalance,
    rate,
    monthlyPayment,
    originatedMonthsAgo,
    termMonths,
    remainingMonths,
    currentCoverages,
    recommendedCoverages,
    estMonthlyPremium,
    signals: signals.sort((a, b) => b.weight - a.weight),
    score,
    tier,
    bestCallWindow: pick(CALL_WINDOWS),
    branchId: branch.id,
    officerId: officer.id,
    memberSinceYears,
    products,
    lastContactDaysAgo,
  };
}

export const BOOK_LOANS: BookLoan[] = Array.from({ length: 64 }, (_, i) => buildLoan(i)).sort(
  (a, b) => b.score - a.score
);

// ---- aggregate stats for the core-sync header / KPIs ----
export const bookStats = {
  scanned: 1284, // simulated total active loans in core
  qualified: BOOK_LOANS.length,
  hot: BOOK_LOANS.filter((l) => l.tier === "Hot").length,
  warm: BOOK_LOANS.filter((l) => l.tier === "Warm").length,
  cool: BOOK_LOANS.filter((l) => l.tier === "Cool").length,
  untappedPremium: BOOK_LOANS.reduce((s, l) => s + l.estMonthlyPremium, 0),
  protectableBalance: BOOK_LOANS.reduce((s, l) => s + l.currentBalance, 0),
  avgScore: Math.round(BOOK_LOANS.reduce((s, l) => s + l.score, 0) / BOOK_LOANS.length),
};

export const signalTone: Record<SignalKind, { label: string; cls: string; dot: string }> = {
  gap: { label: "Coverage gap", cls: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  risk: { label: "Risk signal", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  life: { label: "Life event", cls: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  value: { label: "Value driver", cls: "bg-accent-50 text-accent-800", dot: "bg-accent-500" },
};

export const tierTone: Record<Tier, string> = {
  Hot: "bg-gradient-to-r from-rose-500 to-orange-500 text-white",
  Warm: "bg-gradient-to-r from-amber-400 to-amber-500 text-white",
  Cool: "bg-slate-200 text-slate-600",
};
