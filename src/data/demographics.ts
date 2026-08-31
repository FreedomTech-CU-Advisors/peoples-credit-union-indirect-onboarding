/**
 * Member-demographics dataset for the Coverage Demographics tab.
 *
 * This models the credit union's book of DEBT-PROTECTION-ELIGIBLE members (one row per
 * member, summarizing their primary protected loan) so leadership can see *who* is
 * covered, slice coverage rates across demographic segments, and quantify the risk
 * carried by the members who are NOT covered.
 *
 * Like the rest of the POC, everything here is deterministic (seeded PRNG) so the demo
 * is stable across reloads. To wire a real backend, replace this module — the page reads
 * only from the aggregates exported at the bottom.
 *
 * Coverage status:
 *   - Covered   = carries at least one debt-protection coverage (Life / Disability / IUI)
 *   - Uncovered = eligible loan with zero protection → full balance is unprotected exposure
 */

import { BRANCHES, COVERAGES, type CoverageKey, type LoanType } from "./mock";

// ----------------------------- seeded PRNG (own seed) -----------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(31415927);
const rand = () => rng();
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;

// ----------------------------- domain types -----------------------------
export type AgeBand = "Under 30" | "30–44" | "45–59" | "60+";
export type Generation = "Gen Z" | "Millennial" | "Gen X" | "Boomer+";
export type IncomeBand = "Under $40K" | "$40–75K" | "$75–120K" | "$120K+";
export type TenureBand = "Under 2 yrs" | "2–5 yrs" | "6–10 yrs" | "10+ yrs";
export type RiskTier = "High" | "Moderate" | "Low";

export interface Member {
  id: string;
  name: string;
  age: number;
  ageBand: AgeBand;
  generation: Generation;
  income: number;
  incomeBand: IncomeBand;
  tenureYears: number;
  tenureBand: TenureBand;
  branchId: string;
  dependents: number;
  soleEarner: boolean;
  variableIncome: boolean;
  primaryLoanType: LoanType;
  products: number; // total CU products held
  balance: number; // outstanding balance on the eligible loan
  covered: boolean;
  coverages: CoverageKey[];
  unprotectedBalance: number; // balance with no protection behind it
  riskScore: number; // 0–100 vulnerability if a covered event hit (uncovered only)
  riskTier: RiskTier | null;
}

// ----------------------------- reference pools -----------------------------
const FIRST = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Karen", "Carlos", "Maria", "Daniel", "Nancy", "Andre", "Lisa",
  "DeShawn", "Aisha", "Hector", "Mei", "Priya", "Tyrone", "Yolanda", "Hannah",
  "Logan", "Sofia", "Mateo", "Grace", "Wyatt", "Destiny", "Omar", "Brittany",
];
const LAST = [
  "Anderson", "Nguyen", "Patel", "Garcia", "Johnson", "Williams", "Martinez",
  "Becker", "Schmidt", "Olson", "Hansen", "Reyes", "Thompson", "Carter", "Foster",
  "Bauer", "Novak", "Ramirez", "Brooks", "Sullivan", "Meyer", "Kline", "Vega",
  "Whitfield", "Donovan", "Pittman", "Solis", "Hammond", "Vaughn", "Sweeney",
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
const SECURED: LoanType[] = ["Auto", "Mortgage", "HELOC", "RV / Boat"];

// ----------------------------- band helpers -----------------------------
function ageBandOf(age: number): AgeBand {
  if (age < 30) return "Under 30";
  if (age < 45) return "30–44";
  if (age < 60) return "45–59";
  return "60+";
}
const GEN_BY_BAND: Record<AgeBand, Generation> = {
  "Under 30": "Gen Z",
  "30–44": "Millennial",
  "45–59": "Gen X",
  "60+": "Boomer+",
};
function incomeBandOf(income: number): IncomeBand {
  if (income < 40000) return "Under $40K";
  if (income < 75000) return "$40–75K";
  if (income < 120000) return "$75–120K";
  return "$120K+";
}
function tenureBandOf(yrs: number): TenureBand {
  if (yrs < 2) return "Under 2 yrs";
  if (yrs < 6) return "2–5 yrs";
  if (yrs <= 10) return "6–10 yrs";
  return "10+ yrs";
}

// ----------------------------- coverage propensity -----------------------------
// Built so coverage rates differ meaningfully by segment — that's the whole insight.
function coverageProbability(m: {
  ageBand: AgeBand;
  incomeBand: IncomeBand;
  tenureBand: TenureBand;
  primaryLoanType: LoanType;
  products: number;
  dependents: number;
}): number {
  let p = 0.32;
  // life stage — mid-career members protect most
  if (m.ageBand === "45–59") p += 0.13;
  else if (m.ageBand === "30–44") p += 0.07;
  else if (m.ageBand === "60+") p += 0.0;
  else p -= 0.1; // under 30 under-protect
  // income
  if (m.incomeBand === "$120K+") p += 0.13;
  else if (m.incomeBand === "$75–120K") p += 0.08;
  else if (m.incomeBand === "Under $40K") p -= 0.11;
  // relationship tenure
  if (m.tenureBand === "10+ yrs") p += 0.1;
  else if (m.tenureBand === "6–10 yrs") p += 0.05;
  else if (m.tenureBand === "Under 2 yrs") p -= 0.09;
  // secured loans get offered protection more reliably at origination
  p += SECURED.includes(m.primaryLoanType) ? 0.05 : -0.05;
  // deeper relationships
  p += (m.products - 1) * 0.02;
  // having dependents nudges enrollment up
  p += Math.min(m.dependents, 3) * 0.015;
  return Math.max(0.05, Math.min(0.85, p));
}

// ----------------------------- member generation -----------------------------
const MEMBER_COUNT = 2600;

export const MEMBERS: Member[] = (() => {
  const out: Member[] = [];
  for (let i = 0; i < MEMBER_COUNT; i++) {
    const age = randInt(19, 82);
    const ageBand = ageBandOf(age);
    const generation = GEN_BY_BAND[ageBand];

    // income skews with age a touch
    const incomeBase = 28000 + randInt(0, 110000) + (ageBand === "45–59" ? 15000 : 0);
    const income = Math.round(incomeBase / 1000) * 1000;
    const incomeBand = incomeBandOf(income);

    const tenureYears = randInt(0, 24);
    const tenureBand = tenureBandOf(tenureYears);

    const branchId = pick(BRANCHES).id;
    const dependents = chance(0.55) ? randInt(1, 4) : 0;
    const soleEarner = dependents > 0 && chance(0.42);
    const variableIncome = chance(0.2);

    const primaryLoanType = pick(LOAN_TYPES);
    const [lo, hi] = loanRange[primaryLoanType];
    const balance = randInt(lo / 100, hi / 100) * 100;
    const products = randInt(1, 6);

    const p = coverageProbability({
      ageBand,
      incomeBand,
      tenureBand,
      primaryLoanType,
      products,
      dependents,
    });
    const covered = chance(p);

    const coverages: CoverageKey[] = [];
    if (covered) {
      coverages.push("life");
      if (chance(0.58)) coverages.push("disability");
      if (chance(0.3)) coverages.push("iui");
    }

    const unprotectedBalance = covered ? 0 : balance;

    // vulnerability scoring for the uncovered population
    let riskScore = 0;
    let riskTier: RiskTier | null = null;
    if (!covered) {
      riskScore += Math.min(42, unprotectedBalance / 2200);
      riskScore += dependents * 7;
      riskScore += soleEarner ? 16 : 0;
      riskScore += ageBand === "60+" ? 14 : ageBand === "45–59" ? 6 : 0;
      riskScore += variableIncome ? 10 : 0;
      riskScore += incomeBand === "Under $40K" ? 8 : 0;
      riskScore = Math.min(99, Math.round(riskScore));
      riskTier = riskScore >= 58 ? "High" : riskScore >= 34 ? "Moderate" : "Low";
    }

    out.push({
      id: `M${randInt(100000, 999999)}`,
      name: fullName(),
      age,
      ageBand,
      generation,
      income,
      incomeBand,
      tenureYears,
      tenureBand,
      branchId,
      dependents,
      soleEarner,
      variableIncome,
      primaryLoanType,
      products,
      balance,
      covered,
      coverages,
      unprotectedBalance,
      riskScore,
      riskTier,
    });
  }
  return out;
})();

// ----------------------------- aggregations -----------------------------
const coveredMembers = MEMBERS.filter((m) => m.covered);
const uncoveredMembers = MEMBERS.filter((m) => !m.covered);

export interface SegmentRow {
  band: string;
  total: number;
  covered: number;
  coverageRate: number; // %
  unprotectedBalance: number;
}

function segment<T extends string>(key: (m: Member) => T, order: T[]): SegmentRow[] {
  return order.map((band) => {
    const rows = MEMBERS.filter((m) => key(m) === band);
    const cov = rows.filter((m) => m.covered).length;
    return {
      band,
      total: rows.length,
      covered: cov,
      coverageRate: rows.length ? (cov / rows.length) * 100 : 0,
      unprotectedBalance: rows.reduce((s, m) => s + m.unprotectedBalance, 0),
    };
  });
}

export const coverageByAge = segment((m) => m.ageBand, ["Under 30", "30–44", "45–59", "60+"]);
export const coverageByIncome = segment(
  (m) => m.incomeBand,
  ["Under $40K", "$40–75K", "$75–120K", "$120K+"]
);
export const coverageByTenure = segment(
  (m) => m.tenureBand,
  ["Under 2 yrs", "2–5 yrs", "6–10 yrs", "10+ yrs"]
);
export const coverageByProduct = segment((m) => m.primaryLoanType, LOAN_TYPES);

// covered base profile — mix of who currently carries protection
export const coveredByGeneration = (["Gen Z", "Millennial", "Gen X", "Boomer+"] as Generation[]).map(
  (g) => ({
    label: g,
    count: coveredMembers.filter((m) => m.generation === g).length,
  })
);

// coverage depth among the covered (which coverages they carry)
export const coverageDepth = COVERAGES.map((c) => ({
  key: c.key,
  label: c.short,
  count: coveredMembers.filter((m) => m.coverages.includes(c.key)).length,
}));

// ----------------------------- risk segments (the uncovered) -----------------------------
export interface RiskSegment {
  name: string;
  description: string;
  members: number; // uncovered members in this segment
  coverageRate: number; // coverage rate across the whole segment (covered + uncovered)
  unprotectedBalance: number;
  action: string;
  severity: RiskTier;
}

function riskSegment(
  name: string,
  description: string,
  action: string,
  severity: RiskTier,
  match: (m: Member) => boolean
): RiskSegment {
  const all = MEMBERS.filter(match);
  const uncovered = all.filter((m) => !m.covered);
  return {
    name,
    description,
    members: uncovered.length,
    coverageRate: all.length ? (all.filter((m) => m.covered).length / all.length) * 100 : 0,
    unprotectedBalance: uncovered.reduce((s, m) => s + m.unprotectedBalance, 0),
    action,
    severity,
  };
}

export const riskSegments: RiskSegment[] = [
  riskSegment(
    "Sole earners with dependents",
    "Single-income households supporting children — a covered event puts the whole family on the loan.",
    "Prioritize Life + Disability outreach; lead with family-protection framing.",
    "High",
    (m) => m.soleEarner && m.dependents > 0
  ),
  riskSegment(
    "Members 60 and older",
    "Approaching or in retirement with active loan balances and limited income to absorb a shock.",
    "Review Life coverage on remaining balances at annual check-in.",
    "High",
    (m) => m.ageBand === "60+"
  ),
  riskSegment(
    "High-balance loans ($30K+)",
    "Large outstanding balances where an unprotected event creates the biggest financial hit.",
    "Target for Life + Disability; quantify the unprotected payoff in the conversation.",
    "High",
    (m) => m.balance >= 30000
  ),
  riskSegment(
    "Variable / seasonal income",
    "Irregular earnings make Involuntary Unemployment and Disability coverage especially relevant.",
    "Lead with IUI + Disability; position as income smoothing.",
    "Moderate",
    (m) => m.variableIncome
  ),
  riskSegment(
    "New members (under 2 yrs)",
    "Recently joined and originated without protection — early relationship, easy to add.",
    "Add to onboarding outreach; bundle protection at first servicing touch.",
    "Moderate",
    (m) => m.tenureBand === "Under 2 yrs"
  ),
  riskSegment(
    "Under-30 members",
    "Youngest cohort, lowest coverage — often unaware protection exists or assume they don't need it.",
    "Educational, low-pressure outreach; emphasize affordability per $1,000.",
    "Low",
    (m) => m.ageBand === "Under 30"
  ),
];

// ----------------------------- headline stats -----------------------------
const totalUnprotected = uncoveredMembers.reduce((s, m) => s + m.unprotectedBalance, 0);
const totalProtected = coveredMembers.reduce((s, m) => s + m.balance, 0);

export const demoStats = {
  totalMembers: MEMBERS.length,
  covered: coveredMembers.length,
  uncovered: uncoveredMembers.length,
  coverageRate: (coveredMembers.length / MEMBERS.length) * 100,
  protectedBalance: totalProtected,
  unprotectedBalance: totalUnprotected,
  highRiskUncovered: uncoveredMembers.filter((m) => m.riskTier === "High").length,
  avgCoveredAge: Math.round(
    coveredMembers.reduce((s, m) => s + m.age, 0) / Math.max(1, coveredMembers.length)
  ),
  avgUncoveredAge: Math.round(
    uncoveredMembers.reduce((s, m) => s + m.age, 0) / Math.max(1, uncoveredMembers.length)
  ),
  coverageDepthAvg:
    coveredMembers.reduce((s, m) => s + m.coverages.length, 0) /
    Math.max(1, coveredMembers.length),
  uncoveredWithDependents: uncoveredMembers.filter((m) => m.dependents > 0).length,
};

// ----------------------------- generated insights -----------------------------
export interface Insight {
  tone: "gap" | "risk" | "value";
  text: string;
}

export const insights: Insight[] = (() => {
  const under30 = coverageByAge.find((r) => r.band === "Under 30")!;
  const mid = coverageByAge.find((r) => r.band === "45–59")!;
  const lowInc = coverageByIncome.find((r) => r.band === "Under $40K")!;
  const tenured = coverageByTenure.find((r) => r.band === "10+ yrs")!;
  const newMembers = coverageByTenure.find((r) => r.band === "Under 2 yrs")!;
  const gapMultiple = under30.coverageRate ? mid.coverageRate / under30.coverageRate : 0;

  return [
    {
      tone: "gap",
      text: `Members under 30 carry protection at ${under30.coverageRate.toFixed(
        0
      )}% — roughly ${gapMultiple.toFixed(1)}× lower than the 45–59 cohort (${mid.coverageRate.toFixed(
        0
      )}%). The youngest members are the largest coverage gap.`,
    },
    {
      tone: "value",
      text: `Tenure tracks tightly with coverage: 10+ year members are protected at ${tenured.coverageRate.toFixed(
        0
      )}% vs. ${newMembers.coverageRate.toFixed(
        0
      )}% for members under 2 years — onboarding is the moment to close the gap.`,
    },
    {
      tone: "risk",
      text: `${demoStats.highRiskUncovered.toLocaleString()} uncovered members are flagged high-risk, including ${riskSegments[0].members.toLocaleString()} sole earners with dependents — the most exposed households in the book.`,
    },
    {
      tone: "gap",
      text: `Lowest-income members (under $40K) are protected at only ${lowInc.coverageRate.toFixed(
        0
      )}%, yet they have the least ability to absorb an unprotected balance.`,
    },
  ];
})();

export const branchById = (id: string) => BRANCHES.find((b) => b.id === id);

export const riskTierTone: Record<RiskTier, { cls: string; dot: string }> = {
  High: { cls: "bg-rose-50 text-rose-700 ring-rose-100", dot: "bg-rose-500" },
  Moderate: { cls: "bg-amber-50 text-amber-700 ring-amber-100", dot: "bg-amber-500" },
  Low: { cls: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};
