import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, ShieldCheck, X } from "lucide-react";
import { Card, CardHeader, PageHeader, StatusPill } from "../components/ui";
import {
  BRANCHES,
  COVERAGES,
  OPPORTUNITIES,
  branchById,
  coverageLabel,
  officerById,
  type Opportunity,
} from "../data/mock";
import { num, relativeDays, usd, usd2 } from "../lib/format";
import { coverageColors, filterOpps } from "../lib/metrics";

const STAGES = ["all", "Eligible", "Presented", "Quoted", "Enrolled", "Declined"];

function CoverageChips({ keys }: { keys: Opportunity["coverages"] }) {
  if (!keys.length) return <span className="text-xs text-slate-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((k) => (
        <span
          key={k}
          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
          style={{ background: coverageColors[k] }}
        >
          {coverageLabel(k)}
        </span>
      ))}
    </div>
  );
}

function DetailDrawer({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const officer = officerById(opp.officerId);
  const branch = branchById(opp.branchId);
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between bg-gradient-to-br from-ca-700 to-ca-900 px-6 py-5 text-white">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent-300">
              {opp.id}
            </div>
            <h2 className="mt-1 text-xl font-extrabold">{opp.memberName}</h2>
            <div className="text-sm text-ca-100/80">Member {opp.memberId}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <StatusPill status={opp.stage} />
            <span className="text-xs text-slate-400">Opened {relativeDays(opp.openedDaysAgo)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "Loan type", v: opp.loanType },
              { k: "Loan amount", v: usd(opp.loanAmount) },
              { k: "Eligible", v: opp.eligible ? "Yes" : "No" },
              { k: "Monthly fee", v: opp.monthlyPremium ? usd2(opp.monthlyPremium) : "—" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{s.k}</div>
                <div className="mt-0.5 text-sm font-bold text-slate-800">{s.v}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Coverage
            </div>
            <div className="space-y-2">
              {COVERAGES.map((c) => {
                const active = opp.coverages.includes(c.key);
                return (
                  <div
                    key={c.key}
                    className={`flex items-center justify-between rounded-xl border p-3 ${
                      active ? "border-ca-200 bg-ca-50" : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid h-7 w-7 place-items-center rounded-lg text-white"
                        style={{ background: active ? coverageColors[c.key] : "#cbd5e1" }}
                      >
                        <ShieldCheck size={15} />
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{c.label}</span>
                    </div>
                    <span className={`text-xs font-bold ${active ? "text-accent-700" : "text-slate-300"}`}>
                      {active ? "Enrolled" : "Not enrolled"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Servicing
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Branch</span>
                <span className="font-semibold text-slate-700">{branch.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Officer</span>
                <span className="font-semibold text-slate-700">{officer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className="font-semibold text-slate-700">{officer.role}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-ca-600 py-2.5 text-sm font-semibold text-white hover:bg-ca-700">
              {opp.stage === "Enrolled" ? "Manage coverage" : "Present offer"}
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Notes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Members() {
  const [branch, setBranch] = useState("all");
  const [stage, setStage] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const rows = useMemo(
    () => filterOpps(OPPORTUNITIES, { branchId: branch, stage, q }),
    [branch, stage, q]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Members & Loans"
        subtitle="Every loan opportunity with its debt protection status. Click a row for full detail."
      >
        <span className="pill bg-slate-100 text-slate-600">{num(rows.length)} records</span>
      </PageHeader>

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by member name, member ID, or opportunity ID…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-ca-400 focus:bg-white focus:ring-2 focus:ring-ca-200"
            />
          </div>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">All branches</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  stage === s ? "bg-white text-ca-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Loan</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Coverage</th>
                <th className="px-5 py-3 text-right">Monthly fee</th>
                <th className="px-5 py-3">Branch</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 60).map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-ca-50/40"
                >
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800">{o.memberName}</div>
                    <div className="text-[11px] text-slate-400">{o.id}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{o.loanType}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-700">{usd(o.loanAmount)}</td>
                  <td className="px-5 py-3"><StatusPill status={o.stage} /></td>
                  <td className="px-5 py-3"><CoverageChips keys={o.coverages} /></td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-700">
                    {o.monthlyPremium ? usd2(o.monthlyPremium) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{branchById(o.branchId).name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-400">No matching records.</div>
          )}
          {rows.length > 60 && (
            <div className="border-t border-slate-100 px-5 py-3 text-center text-xs text-slate-400">
              Showing first 60 of {num(rows.length)} — refine filters to narrow results.
            </div>
          )}
        </div>
      </Card>

      {selected && <DetailDrawer opp={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
