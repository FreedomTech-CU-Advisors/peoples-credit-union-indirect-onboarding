import { viz } from "../brand";
import {
  BRANCHES,
  CLAIMS,
  COVERAGES,
  MONTHLY,
  OFFICERS,
  OPPORTUNITIES,
  type CoverageKey,
  type Opportunity,
} from "../data/mock";

// ---- funnel ----
export const funnel = (() => {
  const eligible = OPPORTUNITIES.filter((o) => o.eligible).length;
  const presented = OPPORTUNITIES.filter((o) =>
    ["Presented", "Quoted", "Enrolled", "Declined"].includes(o.stage)
  ).length;
  const quoted = OPPORTUNITIES.filter((o) =>
    ["Quoted", "Enrolled", "Declined"].includes(o.stage)
  ).length;
  const enrolled = OPPORTUNITIES.filter((o) => o.stage === "Enrolled").length;
  return { eligible, presented, quoted, enrolled };
})();

// Penetration = enrolled / eligible
export const penetrationRate = (funnel.enrolled / funnel.eligible) * 100;
// Presentation rate = presented / eligible (are we even offering it?)
export const presentationRate = (funnel.presented / funnel.eligible) * 100;
// Close rate = enrolled / presented
export const closeRate = (funnel.enrolled / funnel.presented) * 100;

// ---- production ----
export const enrolledOpps = OPPORTUNITIES.filter((o) => o.stage === "Enrolled");
export const monthlyPremiumTotal = enrolledOpps.reduce((s, o) => s + o.monthlyPremium, 0);
export const annualizedPremium = monthlyPremiumTotal * 12;
export const protectedBalance = enrolledOpps.reduce((s, o) => s + o.loanAmount, 0);
export const avgPremiumPerEnrollment = monthlyPremiumTotal / Math.max(1, enrolledOpps.length);

// ---- coverage mix ----
export const coverageMix = COVERAGES.map((c) => {
  const count = enrolledOpps.filter((o) => o.coverages.includes(c.key)).length;
  return { key: c.key, label: c.short, count };
});

// avg coverages attached per enrollment (attachment depth)
export const attachmentDepth =
  enrolledOpps.reduce((s, o) => s + o.coverages.length, 0) / Math.max(1, enrolledOpps.length);

// ---- by branch ----
export interface BranchStat {
  id: string;
  name: string;
  city: string;
  eligible: number;
  enrolled: number;
  presented: number;
  penetration: number;
  premium: number;
}
export const branchStats: BranchStat[] = BRANCHES.map((b) => {
  const opps = OPPORTUNITIES.filter((o) => o.branchId === b.id);
  const eligible = opps.filter((o) => o.eligible).length;
  const presented = opps.filter((o) =>
    ["Presented", "Quoted", "Enrolled", "Declined"].includes(o.stage)
  ).length;
  const enrolledList = opps.filter((o) => o.stage === "Enrolled");
  const enrolled = enrolledList.length;
  return {
    id: b.id,
    name: b.name,
    city: b.city,
    eligible,
    presented,
    enrolled,
    penetration: eligible ? (enrolled / eligible) * 100 : 0,
    premium: enrolledList.reduce((s, o) => s + o.monthlyPremium, 0),
  };
}).sort((a, b) => b.penetration - a.penetration);

// ---- by officer (leaderboard) ----
export interface OfficerStat {
  id: string;
  name: string;
  role: string;
  branchName: string;
  avatarHue: number;
  enrolled: number;
  presented: number;
  premium: number;
  goal: number;
  attainment: number;
}
export const officerStats: OfficerStat[] = OFFICERS.map((o) => {
  const opps = OPPORTUNITIES.filter((x) => x.officerId === o.id);
  const enrolledList = opps.filter((x) => x.stage === "Enrolled");
  const presented = opps.filter((x) =>
    ["Presented", "Quoted", "Enrolled", "Declined"].includes(x.stage)
  ).length;
  const branch = BRANCHES.find((b) => b.id === o.branchId)!;
  return {
    id: o.id,
    name: o.name,
    role: o.role,
    branchName: branch.name,
    avatarHue: o.avatarHue,
    enrolled: enrolledList.length,
    presented,
    premium: enrolledList.reduce((s, x) => s + x.monthlyPremium, 0),
    goal: o.monthlyGoal,
    attainment: (enrolledList.length / o.monthlyGoal) * 100,
  };
}).sort((a, b) => b.enrolled - a.enrolled);

// ---- claims summary ----
export const claimStats = (() => {
  const open = CLAIMS.filter((c) =>
    ["Submitted", "In Review", "Pending Info"].includes(c.status)
  ).length;
  const approved = CLAIMS.filter((c) => c.status === "Approved").length;
  const paid = CLAIMS.filter((c) => c.status === "Paid");
  const denied = CLAIMS.filter((c) => c.status === "Denied").length;
  const benefitsPaid = paid.reduce((s, c) => s + c.benefitAmount, 0);
  const decided = paid.length + denied;
  const approvalRate = decided ? ((paid.length + approved) / (decided + approved)) * 100 : 0;
  const avgAge = CLAIMS.reduce((s, c) => s + c.ageDays, 0) / CLAIMS.length;
  return {
    total: CLAIMS.length,
    open,
    approved,
    paidCount: paid.length,
    denied,
    benefitsPaid,
    approvalRate,
    avgAge,
  };
})();

// ---- trend deltas (last vs prior month) ----
export function monthDelta(key: keyof (typeof MONTHLY)[number]) {
  const last = MONTHLY[MONTHLY.length - 1][key] as number;
  const prev = MONTHLY[MONTHLY.length - 2][key] as number;
  return ((last - prev) / prev) * 100;
}

export const totalOpportunities = OPPORTUNITIES.length;

// helper to filter opps for tables
export const filterOpps = (
  opps: Opportunity[],
  { branchId, stage, q }: { branchId?: string; stage?: string; q?: string }
) =>
  opps.filter((o) => {
    if (branchId && branchId !== "all" && o.branchId !== branchId) return false;
    if (stage && stage !== "all" && o.stage !== stage) return false;
    if (q) {
      const t = q.toLowerCase();
      if (
        !o.memberName.toLowerCase().includes(t) &&
        !o.id.toLowerCase().includes(t) &&
        !o.memberId.toLowerCase().includes(t)
      )
        return false;
    }
    return true;
  });

export const coverageColors: Record<CoverageKey, string> = {
  life: viz.primary,
  disability: viz.secondary,
  iui: viz.tertiary,
};
