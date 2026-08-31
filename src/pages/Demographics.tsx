import { viz } from "../brand";
import {
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";
import { Card, CardHeader, KpiCard, PageHeader, ProgressBar } from "../components/ui";
import { compactUsd, num, pct, usd } from "../lib/format";
import { coverageColors } from "../lib/metrics";
import {
  coverageByAge,
  coverageByIncome,
  coverageByProduct,
  coverageByTenure,
  coverageDepth,
  coveredByGeneration,
  demoStats,
  insights,
  type Insight,
  riskSegments,
  type RiskSegment,
  type SegmentRow,
  riskTierTone,
} from "../data/demographics";

const goalPenetration = 42;

const GEN_COLORS: Record<string, string> = {
  "Gen Z": viz.secondary,
  Millennial: viz.tertiary,
  "Gen X": viz.primary,
  "Boomer+": viz.tint,
};

/** Horizontal coverage-rate-by-segment breakdown. */
function SegmentBreakdown({
  rows,
  caption,
}: {
  rows: SegmentRow[];
  caption?: string;
}) {
  const best = Math.max(...rows.map((r) => r.coverageRate));
  return (
    <div className="space-y-3 px-5 pb-5 pt-1">
      {rows.map((r) => {
        const top = r.coverageRate === best;
        return (
          <div key={r.band}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-semibold text-slate-600">{r.band}</span>
              <span className="tabular-nums text-slate-400">
                <span className={`font-bold ${top ? "text-accent-700" : "text-slate-700"}`}>
                  {pct(r.coverageRate, 0)}
                </span>{" "}
                · {num(r.total)} members
              </span>
            </div>
            <ProgressBar
              value={r.coverageRate}
              color={top ? "#059669" : viz.primary}
              height={8}
            />
          </div>
        );
      })}
      {caption && <p className="pt-1 text-[11px] leading-snug text-slate-400">{caption}</p>}
    </div>
  );
}

const insightTone: Record<Insight["tone"], string> = {
  gap: "bg-ca-50 text-ca-700 ring-ca-100",
  risk: "bg-rose-50 text-rose-700 ring-rose-100",
  value: "bg-accent-50 text-accent-800 ring-accent-100",
};

function RiskCard({ seg }: { seg: RiskSegment }) {
  const tone = riskTierTone[seg.severity];
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800">{seg.name}</div>
          <p className="mt-1 text-xs leading-snug text-slate-500">{seg.description}</p>
        </div>
        <span className={`pill shrink-0 ring-1 ${tone.cls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          {seg.severity}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50/70 p-2.5">
          <div className="text-base font-extrabold text-slate-900">{num(seg.members)}</div>
          <div className="text-[10px] font-medium text-slate-500">uncovered</div>
        </div>
        <div className="rounded-xl bg-slate-50/70 p-2.5">
          <div className="text-base font-extrabold text-slate-900">{pct(seg.coverageRate, 0)}</div>
          <div className="text-[10px] font-medium text-slate-500">covered</div>
        </div>
        <div className="rounded-xl bg-rose-50/70 p-2.5">
          <div className="text-base font-extrabold text-rose-700">
            {compactUsd(seg.unprotectedBalance)}
          </div>
          <div className="text-[10px] font-medium text-slate-500">exposed</div>
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-ca-50/60 px-3 py-2">
        <TrendingUp size={14} className="mt-0.5 shrink-0 text-ca-600" />
        <span className="text-[11px] font-medium leading-snug text-ca-800">{seg.action}</span>
      </div>
    </div>
  );
}

export default function Demographics() {
  const depthTotal = coverageDepth.reduce((s, c) => s + c.count, 0);
  const genTotal = coveredByGeneration.reduce((s, g) => s + g.count, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Coverage Demographics"
        subtitle="Who carries debt protection, how coverage breaks down by member segment, and the risk held by the uncovered · June 2026"
      >
        <span className="pill bg-ca-50 text-ca-700 ring-1 ring-ca-100">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> Live demo data
        </span>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Members protected"
          value={num(demoStats.covered)}
          hint={`of ${num(demoStats.totalMembers)} eligible members`}
          icon={<ShieldCheck size={20} />}
        />
        <KpiCard
          label="Member coverage rate"
          value={pct(demoStats.coverageRate)}
          hint={`Goal ${goalPenetration}% · ${demoStats.coverageDepthAvg.toFixed(1)} coverages each`}
          icon={<Users size={20} />}
          accent="accent"
        />
        <KpiCard
          label="Unprotected balance"
          value={compactUsd(demoStats.unprotectedBalance)}
          hint={`${num(demoStats.uncovered)} members with zero protection`}
          icon={<ShieldAlert size={20} />}
          accent="slate"
        />
        <KpiCard
          label="High-risk uncovered"
          value={num(demoStats.highRiskUncovered)}
          hint={`${num(demoStats.uncoveredWithDependents)} uncovered have dependents`}
          icon={<AlertTriangle size={20} />}
          accent="slate"
        />
      </div>

      {/* Covered-vs-uncovered split banner */}
      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <div className="text-sm font-bold text-slate-800">Who's covered</div>
            <div className="mt-0.5 text-xs text-slate-500">
              Share of eligible members carrying protection
            </div>
          </div>
          <div className="flex-1">
            <div className="flex h-7 w-full overflow-hidden rounded-full ring-1 ring-slate-200">
              <div
                className="flex items-center justify-end bg-ca-600 pr-2 text-[11px] font-bold text-white"
                style={{ width: `${demoStats.coverageRate}%` }}
              >
                {pct(demoStats.coverageRate, 0)}
              </div>
              <div className="flex flex-1 items-center pl-2 text-[11px] font-bold text-slate-500">
                Uncovered {pct(100 - demoStats.coverageRate, 0)}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-ca-600" /> Covered (
                {num(demoStats.covered)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-200" /> Uncovered (
                {num(demoStats.uncovered)})
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {[
              { k: "Avg covered age", v: `${demoStats.avgCoveredAge}` },
              { k: "Avg uncovered age", v: `${demoStats.avgUncoveredAge}` },
              { k: "Protected bal.", v: compactUsd(demoStats.protectedBalance) },
            ].map((s) => (
              <div key={s.k} className="text-center">
                <div className="text-lg font-extrabold text-slate-900">{s.v}</div>
                <div className="text-[11px] font-medium text-slate-500">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Coverage by segment */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Coverage rate by age" subtitle="Protection penetration across life stages" />
          <SegmentBreakdown
            rows={coverageByAge}
            caption="Coverage rises through mid-career, then the youngest cohort lags furthest behind."
          />
        </Card>
        <Card>
          <CardHeader title="Coverage rate by income" subtitle="Penetration across income bands" />
          <SegmentBreakdown
            rows={coverageByIncome}
            caption="Lower-income members are least covered despite the least capacity to absorb a loss."
          />
        </Card>
        <Card>
          <CardHeader title="Coverage rate by tenure" subtitle="Penetration by length of membership" />
          <SegmentBreakdown
            rows={coverageByTenure}
            caption="Longer relationships convert better — newest members are the clearest onboarding gap."
          />
        </Card>
        <Card>
          <CardHeader title="Coverage rate by product" subtitle="Penetration by primary loan type" />
          <SegmentBreakdown
            rows={coverageByProduct}
            caption="Secured loans are protected at origination more reliably than revolving / unsecured."
          />
        </Card>
      </div>

      {/* Covered-base profile + coverage depth + insights */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Covered base by generation" subtitle="Who currently carries protection" />
          <div className="flex items-center gap-2 px-2 pb-3 pt-2">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coveredByGeneration}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {coveredByGeneration.map((g) => (
                      <Cell key={g.label} fill={GEN_COLORS[g.label]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                          <div className="font-bold text-slate-700">{payload[0].name}</div>
                          <div className="text-slate-600">
                            {num(payload[0].value)} covered ·{" "}
                            {pct((payload[0].value / genTotal) * 100, 0)}
                          </div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5 pr-3">
              {coveredByGeneration.map((g) => (
                <div key={g.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: GEN_COLORS[g.label] }}
                      />
                      {g.label}
                    </span>
                    <span className="font-bold text-slate-800">{num(g.count)}</span>
                  </div>
                  <div className="mt-1">
                    <ProgressBar
                      value={(g.count / genTotal) * 100}
                      color={GEN_COLORS[g.label]}
                      height={5}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Coverage depth" subtitle="Coverages carried by protected members" />
          <div className="space-y-3 px-5 pb-5 pt-2">
            {coverageDepth.map((c) => (
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
                    value={depthTotal ? (c.count / coverageDepth[0].count) * 100 : 0}
                    color={coverageColors[c.key]}
                    height={6}
                  />
                </div>
              </div>
            ))}
            <p className="pt-1 text-[11px] leading-snug text-slate-400">
              Life is near-universal among the covered; disability and unemployment are the
              upsell layers — {demoStats.coverageDepthAvg.toFixed(1)} coverages attached on average.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="What the data says"
            subtitle="Insights from the coverage demographics"
            action={<Lightbulb size={18} className="text-accent-500" />}
          />
          <div className="space-y-2.5 px-5 pb-5 pt-1">
            {insights.map((ins, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2.5 text-[12px] font-medium leading-snug ring-1 ${insightTone[ins.tone]}`}
              >
                {ins.text}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Uncovered & risk */}
      <Card className="mt-4 overflow-hidden border-rose-100 bg-gradient-to-br from-rose-50/60 to-white">
        <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800">Uncovered population & risk</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {num(demoStats.uncovered)} members carry {compactUsd(demoStats.unprotectedBalance)} in
                unprotected loan balances — prioritized by household vulnerability
              </p>
            </div>
          </div>
          <Link
            to="/outreach"
            className="pill self-start bg-ca-600 text-white hover:bg-ca-700"
          >
            Work these in Outreach →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {riskSegments.map((seg) => (
            <RiskCard key={seg.name} seg={seg} />
          ))}
        </div>
      </Card>
    </div>
  );
}
