import { viz } from "../brand";
import { useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Clock, DollarSign, FileText, X } from "lucide-react";
import { Card, KpiCard, PageHeader, StatusPill } from "../components/ui";
import { CLAIMS, branchById, type Claim, type ClaimStatus } from "../data/mock";
import { num, relativeDays, usd } from "../lib/format";
import { claimStats } from "../lib/metrics";

const COLUMNS: { status: ClaimStatus; tint: string; bar: string }[] = [
  { status: "Submitted", tint: "bg-slate-50", bar: "bg-slate-300" },
  { status: "In Review", tint: "bg-sky-50", bar: "bg-sky-400" },
  { status: "Pending Info", tint: "bg-amber-50", bar: "bg-amber-400" },
  { status: "Approved", tint: "bg-violet-50", bar: "bg-violet-400" },
  { status: "Paid", tint: "bg-accent-50", bar: "bg-accent-400" },
  { status: "Denied", tint: "bg-rose-50", bar: "bg-rose-400" },
];

const typeColor: Record<Claim["type"], string> = {
  Life: viz.primary,
  Disability: viz.secondary,
  "Involuntary Unemployment": viz.tertiary,
};

function ClaimCard({ claim, onClick }: { claim: Claim; onClick: () => void }) {
  const overdue = claim.ageDays > 21 && !["Paid", "Denied"].includes(claim.status);
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-cardhover"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
          style={{ background: typeColor[claim.type] }}
        >
          {claim.type === "Involuntary Unemployment" ? "IUI" : claim.type}
        </span>
        <span className="text-[10px] font-medium text-slate-400">{claim.id}</span>
      </div>
      <div className="mt-2 text-sm font-bold text-slate-800">{claim.memberName}</div>
      <div className="text-[11px] text-slate-400">{claim.loanType} loan</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-extrabold text-slate-900">{usd(claim.benefitAmount)}</span>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
            overdue ? "text-rose-600" : "text-slate-400"
          }`}
        >
          <Clock size={11} /> {claim.ageDays}d
        </span>
      </div>
    </button>
  );
}

function ClaimDrawer({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const steps: ClaimStatus[] = ["Submitted", "In Review", "Approved", "Paid"];
  const idx = claim.status === "Denied" ? -1 : steps.indexOf(claim.status as any);
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between bg-gradient-to-br from-ca-700 to-ca-900 px-6 py-5 text-white">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent-300">{claim.id}</div>
            <h2 className="mt-1 text-xl font-extrabold">{claim.memberName}</h2>
            <div className="text-sm text-ca-100/80">{claim.type} claim</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <StatusPill status={claim.status} />
            <span className="text-xs text-slate-400">Filed {relativeDays(claim.filedDaysAgo)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "Benefit amount", v: usd(claim.benefitAmount) },
              { k: "Loan type", v: claim.loanType },
              { k: "Adjuster", v: claim.adjuster },
              { k: "Age", v: `${claim.ageDays} days` },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{s.k}</div>
                <div className="mt-0.5 text-sm font-bold text-slate-800">{s.v}</div>
              </div>
            ))}
          </div>

          {/* Lifecycle timeline */}
          {claim.status !== "Denied" ? (
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Claim lifecycle
              </div>
              <div className="space-y-0">
                {steps.map((s, i) => {
                  const done = i <= idx;
                  return (
                    <div key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full text-white ${
                            done ? "bg-accent-500" : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          <CheckCircle2 size={14} />
                        </span>
                        {i < steps.length - 1 && (
                          <span className={`h-8 w-0.5 ${done ? "bg-accent-400" : "bg-slate-200"}`} />
                        )}
                      </div>
                      <div className={`pb-6 text-sm font-semibold ${done ? "text-slate-800" : "text-slate-400"}`}>
                        {s}
                        {i === idx && <span className="ml-2 text-xs font-medium text-ca-600">current</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              This claim was <span className="font-bold">denied</span>. Member may appeal within 60
              days of the decision notice.
            </div>
          )}

          <div className="rounded-xl border border-slate-100 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Servicing branch</span>
              <span className="font-semibold text-slate-700">{branchById(claim.branchId).name}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-ca-600 py-2.5 text-sm font-semibold text-white hover:bg-ca-700">
              Advance status
            </button>
            <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <FileText size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Claims() {
  const [selected, setSelected] = useState<Claim | null>(null);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Claims Management"
        subtitle="Track every debt protection claim from submission through payout."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Open claims" value={num(claimStats.open)} icon={<Clock size={20} />} hint="Awaiting action" />
        <KpiCard label="Benefits paid (YTD)" value={usd(claimStats.benefitsPaid)} accent="accent" icon={<DollarSign size={20} />} />
        <KpiCard label="Approval rate" value={`${claimStats.approvalRate.toFixed(0)}%`} icon={<CheckCircle2 size={20} />} hint={`${claimStats.denied} denied`} />
        <KpiCard label="Avg cycle time" value={`${claimStats.avgAge.toFixed(0)} days`} accent="slate" icon={<Clock size={20} />} hint="Submission → decision" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {COLUMNS.map((col) => {
          const cards = CLAIMS.filter((c) => c.status === col.status).sort((a, b) => b.ageDays - a.ageDays);
          return (
            <div key={col.status} className="flex flex-col">
              <div className={`mb-3 flex items-center justify-between rounded-xl ${col.tint} px-3 py-2`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.bar}`} />
                  <span className="text-xs font-bold text-slate-700">{col.status}</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {cards.map((c) => (
                  <ClaimCard key={c.id} claim={c} onClick={() => setSelected(c)} />
                ))}
                {cards.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-[11px] text-slate-300">
                    No claims
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <ClaimDrawer claim={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
