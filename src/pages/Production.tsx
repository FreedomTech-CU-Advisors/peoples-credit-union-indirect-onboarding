import { viz } from "../brand";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, Layers, PiggyBank, ShieldCheck } from "lucide-react";
import { Card, CardHeader, KpiCard, PageHeader, ProgressBar } from "../components/ui";
import { COVERAGES, MONTHLY } from "../data/mock";
import { compactUsd, num, usd, usd2 } from "../lib/format";
import {
  annualizedPremium,
  attachmentDepth,
  branchStats,
  coverageColors,
  enrolledOpps,
  monthDelta,
  monthlyPremiumTotal,
  protectedBalance,
} from "../lib/metrics";

// Approximate fee income contribution by coverage (premium split across attached coverages)
const coverageRevenue = COVERAGES.map((c) => {
  let total = 0;
  for (const o of enrolledOpps) {
    if (o.coverages.includes(c.key)) total += o.monthlyPremium / o.coverages.length;
  }
  return { key: c.key, label: c.short, revenue: total };
}).sort((a, b) => b.revenue - a.revenue);
const revenueTotal = coverageRevenue.reduce((s, c) => s + c.revenue, 0);

const goalLine = Math.round((monthlyPremiumTotal / 1000) * 1.05);
const chartData = MONTHLY.map((m) => ({
  month: m.month,
  feeK: Math.round(m.premium / 1000),
  enrolled: m.enrolled,
  goal: goalLine,
}));

export default function Production() {
  const maxBranchPrem = Math.max(...branchStats.map((b) => b.premium));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Production & Fee Income"
        subtitle="Debt protection sales production, recurring fee income, and protected balances."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Monthly fee income" value={usd(monthlyPremiumTotal)} delta={monthDelta("premium")} icon={<Banknote size={20} />} />
        <KpiCard label="Annualized run-rate" value={compactUsd(annualizedPremium)} accent="accent" icon={<PiggyBank size={20} />} hint="Monthly fees × 12" />
        <KpiCard label="Protected balance" value={compactUsd(protectedBalance)} icon={<ShieldCheck size={20} />} hint={`${num(enrolledOpps.length)} enrollments`} />
        <KpiCard label="Avg fee / enrollment" value={usd2(monthlyPremiumTotal / enrolledOpps.length)} accent="slate" icon={<Layers size={20} />} hint={`${attachmentDepth.toFixed(1)} coverages each`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly fee income vs. target" subtitle="Recurring DP fee income ($K) and new enrollments" />
          <div className="h-80 px-2 pb-3 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eef0f4" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis yAxisId="l" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" width={40} tickFormatter={(v) => `$${v}K`} />
                <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" width={32} />
                <Tooltip
                  cursor={{ fill: "#f4f7fb" }}
                  content={({ active, payload, label }: any) =>
                    active && payload?.length ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                        <div className="mb-1 font-bold text-slate-700">{label}</div>
                        <div className="text-slate-600">Fee income: {usd(payload.find((p: any) => p.dataKey === "feeK")?.value * 1000)}</div>
                        <div className="text-slate-600">Enrollments: {num(payload.find((p: any) => p.dataKey === "enrolled")?.value)}</div>
                      </div>
                    ) : null
                  }
                />
                <Bar yAxisId="l" dataKey="feeK" name="Fee income ($K)" fill={viz.primary} radius={[5, 5, 0, 0]} barSize={20} />
                <Line yAxisId="l" dataKey="goal" name="Target" stroke={viz.secondary} strokeWidth={2} strokeDasharray="5 4" dot={false} />
                <Line yAxisId="r" dataKey="enrolled" name="Enrollments" stroke={viz.tertiary} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Fee income by coverage" subtitle="Estimated monthly contribution" />
          <div className="space-y-4 px-5 pb-5 pt-4">
            {coverageRevenue.map((c) => (
              <div key={c.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <span className="h-3 w-3 rounded" style={{ background: coverageColors[c.key] }} />
                    {c.label}
                  </span>
                  <span className="font-bold text-slate-800">{usd(c.revenue)}</span>
                </div>
                <ProgressBar value={(c.revenue / revenueTotal) * 100} color={coverageColors[c.key]} height={8} />
                <div className="mt-1 text-[11px] text-slate-400">
                  {((c.revenue / revenueTotal) * 100).toFixed(0)}% of fee income
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-ca-50 p-3 text-xs text-ca-800">
              <span className="font-bold">{usd(revenueTotal)}/mo</span> total recurring fee income
              across {num(enrolledOpps.length)} protected loans.
            </div>
          </div>
        </Card>
      </div>

      {/* Branch production table */}
      <Card className="mt-4">
        <CardHeader title="Production by branch" subtitle="Monthly fee income, enrollments, and penetration" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3">Enrollments</th>
                <th className="px-5 py-3">Penetration</th>
                <th className="px-5 py-3 text-right">Monthly fee income</th>
                <th className="w-48 px-5 py-3">Share</th>
              </tr>
            </thead>
            <tbody>
              {branchStats.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800">{b.name}</div>
                    <div className="text-[11px] text-slate-400">{b.city}</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{num(b.enrolled)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${b.penetration >= 42 ? "text-accent-700" : "text-slate-700"}`}>
                      {b.penetration.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{usd(b.premium)}</td>
                  <td className="px-5 py-3">
                    <ProgressBar value={(b.premium / maxBranchPrem) * 100} color={viz.primary} height={7} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
