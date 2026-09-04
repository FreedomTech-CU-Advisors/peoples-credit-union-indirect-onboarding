/**
 * Deterministic mock dataset for Peoples Credit Union Indirect Onboarding (proof of concept).
 * A seeded PRNG keeps the numbers stable across reloads so the demo always looks the same.
 * Brand-specific reference data (branch network / market) comes from src/brand.
 *
 * Debt Protection (a.k.a. Payment Protection) lets a member cancel some or all of a loan
 * balance / payment when a covered life event happens. Standard coverages modeled here:
 *   - Life (death)
 *   - Disability
 *   - Involuntary Unemployment (IUI)
 */

import { activeBrand } from "../brand";

// ----------------------------- seeded PRNG -----------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260616);
const rand = () => rng();
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;

// ----------------------------- domain types -----------------------------
export type CoverageKey = "life" | "disability" | "iui";
export type LoanType =
  | "Auto"
  | "Personal"
  | "Credit Card"
  | "HELOC"
  | "Mortgage"
  | "RV / Boat";
export type OppStage = "Eligible" | "Presented" | "Quoted" | "Enrolled" | "Declined";
export type ClaimType = "Life" | "Disability" | "Involuntary Unemployment";
export type ClaimStatus =
  | "Submitted"
  | "In Review"
  | "Pending Info"
  | "Approved"
  | "Paid"
  | "Denied";

export interface Coverage {
  key: CoverageKey;
  label: string;
  short: string;
}

export const COVERAGES: Coverage[] = [
  { key: "life", label: "Life (Death)", short: "Life" },
  { key: "disability", label: "Disability", short: "Disability" },
  { key: "iui", label: "Involuntary Unemployment", short: "IUI" },
];

export interface Branch {
  id: string;
  name: string;
  city: string;
}

export interface Officer {
  id: string;
  name: string;
  role: "MSR" | "Loan Officer" | "Branch Manager";
  branchId: string;
  avatarHue: number;
  monthlyGoal: number; // enrollment count goal / month
}

export interface Opportunity {
  id: string;
  memberName: string;
  memberId: string;
  loanType: LoanType;
  loanAmount: number;
  branchId: string;
  officerId: string;
  stage: OppStage;
  coverages: CoverageKey[]; // enrolled coverages (if Enrolled)
  monthlyPremium: number; // est. monthly DP fee if enrolled
  openedDaysAgo: number;
  eligible: boolean;
}

export interface Claim {
  id: string;
  memberName: string;
  memberId: string;
  type: ClaimType;
  status: ClaimStatus;
  loanType: LoanType;
  benefitAmount: number;
  filedDaysAgo: number;
  branchId: string;
  ageDays: number;
  adjuster: string;
}

export interface MonthPoint {
  month: string;
  opportunities: number;
  presented: number;
  enrolled: number;
  premium: number; // monthly recurring DP fee income added
  claimsPaid: number;
}

// ----------------------------- reference data -----------------------------
// Branch network is Peoples Credit Union (central Iowa).
export const BRANCHES: Branch[] = activeBrand.branches;

const FIRST = [
  "Jordan", "Taylor", "Morgan", "Alexis", "Cameron", "Riley", "Avery", "Jamie",
  "Drew", "Sydney", "Parker", "Casey", "Reese", "Quinn", "Hayden", "Emerson",
  "Marcus", "Priya", "Diego", "Mei", "Aaliyah", "Liam", "Sofia", "Noah",
  "Olivia", "Ethan", "Maya", "Lucas", "Chloe", "Mateo", "Harper", "Elijah",
];
const LAST = [
  "Anderson", "Nguyen", "Patel", "Garcia", "Johnson", "Williams", "Martinez",
  "Becker", "Schmidt", "Olson", "Hansen", "Reyes", "Thompson", "Carter",
  "Foster", "Bauer", "Novak", "Ramirez", "Brooks", "Sullivan", "Meyer", "Kline",
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

// ----------------------------- officers -----------------------------
export const OFFICERS: Officer[] = (() => {
  const out: Officer[] = [];
  let n = 0;
  for (const b of BRANCHES) {
    const count = randInt(2, 4);
    for (let i = 0; i < count; i++) {
      n++;
      const role: Officer["role"] =
        i === 0 ? "Branch Manager" : chance(0.5) ? "Loan Officer" : "MSR";
      out.push({
        id: `o${n}`,
        name: fullName(),
        role,
        branchId: b.id,
        avatarHue: randInt(0, 359),
        monthlyGoal: randInt(10, 22),
      });
    }
  }
  return out;
})();

// ----------------------------- opportunities -----------------------------
function makePremium(coverages: CoverageKey[], loanAmount: number): number {
  // Roughly $0.70–$1.20 per $1,000 of balance per coverage, blended.
  const perK = 0.55 + coverages.length * 0.22;
  return Math.round((loanAmount / 1000) * perK * 100) / 100;
}

export const OPPORTUNITIES: Opportunity[] = (() => {
  const out: Opportunity[] = [];
  for (let i = 0; i < 320; i++) {
    const loanType = pick(LOAN_TYPES);
    const [lo, hi] = loanRange[loanType];
    const loanAmount = randInt(lo / 100, hi / 100) * 100;
    const eligible = chance(0.86);
    const branch = pick(BRANCHES);
    const branchOfficers = OFFICERS.filter((o) => o.branchId === branch.id);
    const officer = pick(branchOfficers);

    // Stage funnel — most eligible loans get presented; fewer enroll.
    let stage: OppStage;
    if (!eligible) stage = "Eligible";
    else {
      const r = rand();
      if (r < 0.18) stage = "Eligible"; // not yet presented
      else if (r < 0.42) stage = "Presented";
      else if (r < 0.56) stage = "Quoted";
      else if (r < 0.82) stage = "Enrolled";
      else stage = "Declined";
    }

    let coverages: CoverageKey[] = [];
    if (stage === "Enrolled") {
      coverages.push("life");
      if (chance(0.62)) coverages.push("disability");
      if (chance(0.34)) coverages.push("iui");
    }

    out.push({
      id: `OPP-${(10240 + i).toString()}`,
      memberName: fullName(),
      memberId: `M${randInt(100000, 999999)}`,
      loanType,
      loanAmount,
      branchId: branch.id,
      officerId: officer.id,
      stage,
      coverages,
      monthlyPremium: stage === "Enrolled" ? makePremium(coverages, loanAmount) : 0,
      openedDaysAgo: randInt(0, 45),
      eligible,
    });
  }
  return out;
})();

// ----------------------------- claims -----------------------------
const CLAIM_TYPES: ClaimType[] = ["Life", "Disability", "Involuntary Unemployment"];
const ADJUSTERS = ["B. Hollis", "T. Marsh", "R. Okafor", "L. Castillo", "S. Petersen"];

export const CLAIMS: Claim[] = (() => {
  const out: Claim[] = [];
  const statuses: ClaimStatus[] = [
    "Submitted", "In Review", "Pending Info", "Approved", "Paid", "Denied",
  ];
  const statusWeights = [0.16, 0.22, 0.12, 0.14, 0.26, 0.1];
  for (let i = 0; i < 46; i++) {
    const type = pick(CLAIM_TYPES);
    const loanType = pick(LOAN_TYPES);
    const [lo, hi] = loanRange[loanType];
    const benefitAmount =
      type === "Life"
        ? randInt(lo / 100, hi / 100) * 100
        : randInt(300, 2400); // monthly benefit for disability/IUI
    // weighted status pick
    let r = rand();
    let status: ClaimStatus = "Submitted";
    for (let s = 0; s < statuses.length; s++) {
      if (r < statusWeights[s]) {
        status = statuses[s];
        break;
      }
      r -= statusWeights[s];
    }
    const branch = pick(BRANCHES);
    out.push({
      id: `CLM-${(58200 + i).toString()}`,
      memberName: fullName(),
      memberId: `M${randInt(100000, 999999)}`,
      type,
      status,
      loanType,
      benefitAmount,
      filedDaysAgo: randInt(0, 60),
      branchId: branch.id,
      ageDays: randInt(1, 38),
      adjuster: pick(ADJUSTERS),
    });
  }
  return out;
})();

// ----------------------------- 12-month trend -----------------------------
const MONTH_LABELS = [
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
];

export const MONTHLY: MonthPoint[] = (() => {
  const out: MonthPoint[] = [];
  let base = 280;
  let prem = 41000;
  for (let i = 0; i < 12; i++) {
    const growth = 1 + (rand() * 0.06 - 0.01) + i * 0.004;
    base = Math.round(base * growth);
    const opportunities = base + randInt(-12, 18);
    const presented = Math.round(opportunities * (0.7 + rand() * 0.1));
    const enrolled = Math.round(presented * (0.42 + rand() * 0.12));
    prem = Math.round(prem * (1 + (rand() * 0.05 - 0.005)));
    out.push({
      month: MONTH_LABELS[i],
      opportunities,
      presented,
      enrolled,
      premium: prem + randInt(-1500, 2500),
      claimsPaid: randInt(6, 19),
    });
  }
  return out;
})();

// ----------------------------- helpers / lookups -----------------------------
export const branchById = (id: string) => BRANCHES.find((b) => b.id === id)!;
export const officerById = (id: string) => OFFICERS.find((o) => o.id === id)!;
export const coverageLabel = (k: CoverageKey) => COVERAGES.find((c) => c.key === k)!.short;
