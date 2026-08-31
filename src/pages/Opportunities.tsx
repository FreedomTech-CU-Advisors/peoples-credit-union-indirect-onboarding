import { viz } from "../brand";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Filter, Sparkles } from "lucide-react";
import { Card, CardHeader, KpiCard, PageHeader, ProgressBar, StatusPill } from "../components/ui";
import { BRANCHES, OPPORTUNITIES, officerById, type LoanType } from "../data/mock";
import { num, pct, usd } from "../lib/format";
import { closeRate, funnel, penetrationRate, presentationRate } from "../lib/metrics";

const LOAN_TYPES: LoanType[] = ["Auto", "Personal", "Credit Card", "HELOC", "Mortgage", "RV / Boat"];

const funnelData = [
  { name: "Eligible", value: funnel.eligible, fill: viz.faint },
  { name: "Presented", value: funnel.presented, fill: viz.tint },
  { name: "Quoted", value: funnel.quoted, fill: viz.tertiary },
  { name: "Enrolled", value: funnel.enrolled, fill: viz.primary },
];

const penByType = LOAN_TYPES.map((t) => {
  const opps = OPPORTUNITIES.filter((o) => o.loanType === t && o.eligible);
  const enrolled = opps.filter((o) => o.stage === "Enrolled").length;
  return {
    type: t,
    penetration: opps.length ? (enrolled / opps.length) * 100 : 0,
    eligible: opps.length,
    enrolled,
  };
}).sort((a, b) => b.penetration - a.penetration);

export default function Opportunities() {
  const [branch, setBranch] = useState("all");

  const queue = useMemo(
    () =>
      OPPORTUNITIES.filter(
        (o) => o.eligible && o.stage === "Eligible" && (branch === "all" || o.branchId === branch)
      )
        .sort((a, b) => b.loanAmount - a.loanAmount)
        .slice(0, 8),
    [branch]
  );

  const declined = OPPORTUNITIES.filter((o) => o.stage === "Declined").length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Opportunities & Penetration"
        subtitle="Every eligible loan is a debt protection opportunity — track how many we present, quote, and close."
      >
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <Filter size={14} className="text-slate-400" />
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">All branches</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Eligible loans" value={num(funnel.eligible)} icon={<Sparkles size={20} />} hint="Loans that qualify for DP" />
        <KpiCard label="Presentation rate" value={pct(presentationRate, 0)} accent="accent" icon={<ArrowRight size={20} />} hint={`${num(funnel.presented)} presented`} />
        <KpiCard label="Penetration rate" value={pct(penetrationRate)} icon={<Sparkles size={20} />} hint={`${num(funnel.enrolled)} enrolled`} />
        <KpiCard label="Close rate" value={pct(closeRate, 0)} accent="slate" icon={<ArrowRight size={20} />} hint={`${num(declined)} declined after offer`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Conversion funnel" subtitle="Where opportunities are won or lost" />
          <div className="h-72 px-2 pb-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  content={({ active, payload }: any) =>
                    active && payload?.length ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                        <span className="font-bold text-slate-700">{payload[0].payload.name}: </span>
                        <span className="text-slate-600">{num(payload[0].value)} loans</span>
                      </div>
                    ) : null
                  }
                />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" dataKey="name" fontSize={12} fill="#475569" />
                  <LabelList position="center" dataKey="value" fontSize={13} fill="#fff" fontWeight={700} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 px-5 py-3 text-center">
            {[
              { k: "Eligible → Presented", v: pct((funnel.presented / funnel.eligible) * 100, 0) },
              { k: "Presented → Quoted", v: pct((funnel.quoted / funnel.presented) * 100, 0) },
              { k: "Quoted → Enrolled", v: pct((funnel.enrolled / funnel.quoted) * 100, 0) },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-base font-extrabold text-ca-700">{s.v}</div>
                <div className="text-[10px] font-medium text-slate-500">{s.k}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Penetration by loan type" subtitle="Which products convert best" />
          <div className="h-72 px-3 pb-4 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={penByType} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <YAxis type="category" dataKey="type" tickLine={false} axisLine={false} fontSize={12} stroke="#475569" width={80} />
                <Tooltip
                  cursor={{ fill: viz.wash }}
                  content={({ active, payload, label }: any) =>
                    active && payload?.length ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                        <div className="font-bold text-slate-700">{label}</div>
                        <div className="text-slate-600">Penetration: {pct(payload[0].value)}</div>
                        <div className="text-slate-600">
                          {payload[0].payload.enrolled} of {payload[0].payload.eligible} eligible
                        </div>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="penetration" radius={[0, 6, 6, 0]} barSize={22}>
                  {penByType.map((d) => (
                    <Cell key={d.type} fill={d.penetration >= 42 ? "#059669" : viz.tertiary} />
                  ))}
                  <LabelList dataKey="penetration" position="right" formatter={(v: number) => `${v.toFixed(0)}%`} fontSize={11} fill="#64748b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Action queue */}
      <Card className="mt-4">
        <CardHeader
          title="Action queue — eligible, not yet presented"
          subtitle="High-value loans where debt protection hasn't been offered. Reach out before the loan closes."
          action={<span className="pill bg-amber-100 text-amber-700">{num(queue.length)} to action</span>}
        />
        <div className="divide-y divide-slate-100">
          {queue.map((o) => {
            const officer = officerById(o.officerId);
            return (
              <div key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-slate-50/60">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-ca-50 text-xs font-bold text-ca-700">
                  {o.loanType.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-[140px] flex-1">
                  <div className="text-sm font-semibold text-slate-800">{o.memberName}</div>
                  <div className="text-xs text-slate-400">
                    {o.id} · {o.loanType}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-slate-800">{usd(o.loanAmount)}</div>
                  <div className="text-[11px] text-slate-400">loan amount</div>
                </div>
                <div className="hidden w-32 md:block">
                  <div className="text-xs font-medium text-slate-600">{officer.name}</div>
                  <div className="text-[11px] text-slate-400">{officer.role}</div>
                </div>
                <StatusPill status={o.stage} />
                <button className="rounded-lg bg-ca-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ca-700">
                  Present offer
                </button>
              </div>
            );
          })}
          {queue.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No open opportunities for this branch — nice work.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
