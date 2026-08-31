import { viz } from "../brand";
import {
  DollarSign,
  LifeBuoy,
  Percent,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { Card, CardHeader, KpiCard, PageHeader, ProgressBar, StatusPill } from "../components/ui";
import { CLAIMS, MONTHLY } from "../data/mock";
import { compactUsd, num, pct, usd, usd2 } from "../lib/format";
import {
  annualizedPremium,
  attachmentDepth,
  branchStats,
  claimStats,
  closeRate,
  coverageColors,
  coverageMix,
  funnel,
  monthDelta,
  monthlyPremiumTotal,
  penetrationRate,
  presentationRate,
  protectedBalance,
} from "../lib/metrics";

const fmtMonth = MONTHLY.map((m) => ({ ...m, premiumK: Math.round(m.premium / 1000) }));

function ChartTip({ active, payload, label, money }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-bold text-slate-700">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-800">
            {money?.includes(p.dataKey) ? usd(p.value * (p.dataKey === "premiumK" ? 1000 : 1)) : num(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function FunnelStrip() {
  const steps = [
    { label: "Eligible loans", value: funnel.eligible, color: viz.faint },
    { label: "Presented", value: funnel.presented, color: viz.tint },
    { label: "Quoted", value: funnel.quoted, color: viz.tertiary },
    { label: "Enrolled", value: funnel.enrolled, color: viz.primary },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-4">
      {steps.map((s, i) => {
        const conv = i === 0 ? 100 : (s.value / steps[0].value) * 100;
        return (
          <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{s.label}</span>
              <span className="text-[10px] font-bold text-slate-400">{conv.toFixed(0)}%</span>
            </div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">{num(s.value)}</div>
            <div className="mt-2">
              <ProgressBar value={conv} color={s.color} height={6} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Overview() {
  const recentClaims = [...CLAIMS].sort((a, b) => a.filedDaysAgo - b.filedDaysAgo).slice(0, 5);
  const topBranches = branchStats.slice(0, 6);
  const goalPenetration = 42;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Debt Protection Overview"
        subtitle="Enterprise view of opportunities, penetration, production, and claims · June 2026"
      >
        <span className="pill bg-ca-50 text-ca-700 ring-1 ring-ca-100">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> Live demo data
        </span>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Monthly DP fee income"
          value={usd(monthlyPremiumTotal)}
          delta={monthDelta("premium")}
          hint={`${compactUsd(annualizedPremium)} annualized`}
          icon={<DollarSign size={20} />}
        />
        <KpiCard
          label="Penetration rate"
          value={pct(penetrationRate)}
          delta={monthDelta("enrolled") - monthDelta("opportunities")}
          hint={`Goal ${goalPenetration}% · ${pct(presentationRate, 0)} presented`}
          icon={<Percent size={20} />}
          accent="accent"
        />
        <KpiCard
          label="Protected loan balance"
          value={compactUsd(protectedBalance)}
          delta={monthDelta("enrolled")}
          hint={`${num(funnel.enrolled)} active enrollments`}
          icon={<ShieldCheck size={20} />}
        />
        <KpiCard
          label="Open claims"
          value={num(claimStats.open)}
          hint={`${usd(claimStats.benefitsPaid)} benefits paid YTD`}
          icon={<LifeBuoy size={20} />}
          accent="slate"
        />
      </div>

      {/* Penetration goal banner */}
      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <div className="text-sm font-bold text-slate-800">Penetration vs. Q2 goal</div>
            <div className="mt-0.5 text-xs text-slate-500">
              Enrolled / eligible loans across all branches
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="font-semibold text-ca-700">
                {pct(penetrationRate)} current
              </span>
              <span className="text-slate-400">Goal {goalPenetration}%</span>
            </div>
            <div className="relative">
              <ProgressBar value={penetrationRate} max={goalPenetration} height={12} />
              <div
                className="absolute -top-1 h-[20px] w-0.5 bg-slate-400"
                style={{ left: "100%" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {[
              { k: "Close rate", v: pct(closeRate, 0) },
              { k: "Attach depth", v: `${attachmentDepth.toFixed(1)}×` },
              { k: "Avg fee", v: usd2(monthlyPremiumTotal / funnel.enrolled) },
            ].map((s) => (
              <div key={s.k} className="text-center">
                <div className="text-lg font-extrabold text-slate-900">{s.v}</div>
                <div className="text-[11px] font-medium text-slate-500">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Charts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Enrollment & fee income trend"
            subtitle="Trailing 12 months"
            action={
              <span className="pill bg-accent-100 text-accent-800">
                <TrendingUp size={13} /> +{monthDelta("enrolled").toFixed(1)}% MoM
              </span>
            }
          />
          <div className="h-72 px-2 pb-3 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fmtMonth} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPrem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={viz.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={viz.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gEnr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis yAxisId="l" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" width={36} />
                <Tooltip content={<ChartTip money={["premiumK"]} />} />
                <Area
                  yAxisId="l"
                  type="monotone"
                  dataKey="premiumK"
                  name="Fee income ($K)"
                  stroke={viz.primary}
                  strokeWidth={2.5}
                  fill="url(#gPrem)"
                />
                <Area
                  yAxisId="l"
                  type="monotone"
                  dataKey="enrolled"
                  name="Enrollments"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#gEnr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Coverage mix" subtitle="Active enrollments by coverage" />
          <div className="flex items-center gap-2 px-2 pb-2 pt-2">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coverageMix}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {coverageMix.map((c) => (
                      <Cell key={c.key} fill={coverageColors[c.key]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 pr-3">
              {coverageMix.map((c) => {
                const total = coverageMix.reduce((s, x) => s + x.count, 0);
                return (
                  <div key={c.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: coverageColors[c.key] }}
                        />
                        {c.label}
                      </span>
                      <span className="font-bold text-slate-800">{num(c.count)}</span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar
                        value={(c.count / total) * 100}
                        color={coverageColors[c.key]}
                        height={5}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="pt-1 text-[11px] leading-snug text-slate-400">
                {attachmentDepth.toFixed(1)} coverages attached per enrolled loan on average.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel + branch + claims */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Opportunity funnel"
            subtitle="From eligible loan to enrolled coverage"
            action={
              <Link to="/opportunities" className="text-xs font-semibold text-ca-700 hover:underline">
                View pipeline →
              </Link>
            }
          />
          <FunnelStrip />
        </Card>

        <Card>
          <CardHeader title="Claims snapshot" subtitle={`${claimStats.total} claims tracked`}
            action={
              <Link to="/claims" className="text-xs font-semibold text-ca-700 hover:underline">
                Manage →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-2 px-5 pb-2 pt-1">
            {[
              { k: "Open", v: claimStats.open, c: "text-sky-600" },
              { k: "Approved", v: claimStats.approved, c: "text-violet-600" },
              { k: "Paid", v: claimStats.paidCount, c: "text-accent-600" },
              { k: "Avg age", v: `${claimStats.avgAge.toFixed(0)}d`, c: "text-slate-700" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl bg-slate-50/70 p-3">
                <div className={`text-xl font-extrabold ${s.c}`}>{s.v}</div>
                <div className="text-[11px] font-medium text-slate-500">{s.k}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2 px-5 pb-5 pt-2">
            {recentClaims.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-700">{c.memberName}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.type} · {c.id}
                  </div>
                </div>
                <StatusPill status={c.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Branch leaderboard */}
      <Card className="mt-4">
        <CardHeader
          title="Branch penetration leaderboard"
          subtitle="Penetration rate and monthly fee income by branch"
          action={
            <Link to="/team" className="text-xs font-semibold text-ca-700 hover:underline">
              All branches →
            </Link>
          }
        />
        <div className="h-64 px-3 pb-4 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topBranches} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" width={34}
                tickFormatter={(v) => `${v}%`} />
              <Tooltip
                cursor={{ fill: viz.wash }}
                content={({ active, payload, label }: any) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                      <div className="font-bold text-slate-700">{label}</div>
                      <div className="text-slate-600">Penetration: {pct(payload[0].value)}</div>
                      <div className="text-slate-600">Fee income: {usd(payload[0].payload.premium)}/mo</div>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="penetration" radius={[6, 6, 0, 0]}>
                {topBranches.map((b) => (
                  <Cell key={b.id} fill={b.penetration >= goalPenetration ? "#059669" : viz.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
