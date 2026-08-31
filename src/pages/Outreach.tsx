import { useMemo, useState } from "react";
import {
  Database,
  Filter,
  Flame,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import CallWizard from "../components/CallWizard";
import { Avatar, Card, CardHeader, KpiCard, PageHeader } from "../components/ui";
import {
  BOOK_LOANS,
  bookStats,
  signalTone,
  tierTone,
  type BookLoan,
  type Tier,
} from "../data/book";
import { BRANCHES, branchById, coverageLabel } from "../data/mock";
import { compactUsd, num, usd, usd2 } from "../lib/format";
import { coverageColors } from "../lib/metrics";

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const color = score >= 75 ? "#f43f5e" : score >= 55 ? "#f59e0b" : "#8f877c";
  return (
    <div className="relative grid h-14 w-14 place-items-center">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#eef0f4" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <span className="absolute text-sm font-extrabold text-slate-800">{score}</span>
    </div>
  );
}

function OppRow({ loan, rank, onCall }: { loan: BookLoan; rank: number; onCall: () => void }) {
  const branch = branchById(loan.branchId);
  return (
    <div className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50/70 lg:flex-row lg:items-center">
      <div className="flex items-center gap-3 lg:w-72">
        <span className="w-6 text-center text-sm font-bold text-slate-300">{rank}</span>
        <ScoreRing score={loan.score} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold text-slate-800">{loan.memberName}</span>
            <span className={`pill ${tierTone[loan.tier]}`}>
              {loan.tier === "Hot" && <Flame size={11} />} {loan.tier}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {loan.id} · {loan.loanType} · {branch.name}
          </div>
        </div>
      </div>

      {/* signals */}
      <div className="flex flex-1 flex-wrap gap-1.5">
        {loan.signals.slice(0, 3).map((s) => {
          const tone = signalTone[s.kind];
          return (
            <span key={s.label} className={`pill ${tone.cls}`} title={s.detail}>
              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
              {s.label}
            </span>
          );
        })}
        {loan.signals.length > 3 && (
          <span className="pill bg-slate-100 text-slate-500">+{loan.signals.length - 3}</span>
        )}
      </div>

      {/* recommend + premium */}
      <div className="flex items-center gap-4 lg:w-64 lg:justify-end">
        <div className="text-right">
          <div className="flex justify-end gap-1">
            {loan.recommendedCoverages.map((k) => (
              <span
                key={k}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: coverageColors[k] }}
              >
                {coverageLabel(k)}
              </span>
            ))}
          </div>
          <div className="mt-1 text-sm font-extrabold text-slate-800">
            +{usd2(loan.estMonthlyPremium)}<span className="text-[11px] font-medium text-slate-400">/mo</span>
          </div>
          <div className="text-[11px] text-slate-400">protects {usd(loan.currentBalance)}</div>
        </div>
        <button
          onClick={onCall}
          className="flex items-center gap-1.5 rounded-xl bg-ca-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-ca-700"
        >
          <Phone size={15} /> Call
        </button>
      </div>
    </div>
  );
}

const TIERS: (Tier | "All")[] = ["All", "Hot", "Warm", "Cool"];

export default function Outreach() {
  const [tier, setTier] = useState<Tier | "All">("All");
  const [branch, setBranch] = useState("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<BookLoan | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState("Today, 6:14 AM");

  const rows = useMemo(
    () =>
      BOOK_LOANS.filter((l) => {
        if (tier !== "All" && l.tier !== tier) return false;
        if (branch !== "all" && l.branchId !== branch) return false;
        if (q) {
          const t = q.toLowerCase();
          if (
            !l.memberName.toLowerCase().includes(t) &&
            !l.id.toLowerCase().includes(t) &&
            !l.memberId.toLowerCase().includes(t)
          )
            return false;
        }
        return true;
      }),
    [tier, branch, q]
  );

  const runSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncedAt("Just now");
    }, 1600);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Post-Origination Outreach"
        subtitle="Existing loans on the books with a protection gap — ranked so consultants call the highest-value members first."
      >
        <span className="pill bg-rose-50 text-rose-700">
          <Flame size={12} /> {bookStats.hot} hot leads
        </span>
      </PageHeader>

      {/* Core sync banner */}
      <Card className="mb-4 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3 lg:w-72">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ca-600/10 text-ca-700">
              <Database size={22} />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-800">Core system feed</div>
              <div className="text-[11px] text-slate-400">Symitar · last sync {syncedAt}</div>
            </div>
          </div>
          {/* mini pipeline */}
          <div className="flex flex-1 items-center justify-between gap-1 text-center">
            {[
              { k: "Active loans scanned", v: num(bookStats.scanned) },
              { k: "Eligible for DP", v: num(897) },
              { k: "Coverage gap", v: num(bookStats.qualified + 120) },
              { k: "Qualified leads", v: num(bookStats.qualified), hot: true },
            ].map((s, i) => (
              <div key={s.k} className="flex flex-1 items-center">
                <div className="flex-1">
                  <div className={`text-xl font-extrabold ${s.hot ? "text-ca-700" : "text-slate-800"}`}>
                    {s.v}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {s.k}
                  </div>
                </div>
                {i < 3 && <div className="hidden h-8 w-px bg-slate-200 sm:block" />}
              </div>
            ))}
          </div>
          <button
            onClick={runSync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 rounded-xl border border-ca-200 bg-ca-50 px-4 py-2.5 text-sm font-semibold text-ca-700 transition hover:bg-ca-100 disabled:opacity-70"
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing core…" : "Re-sync now"}
          </button>
        </div>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Qualified opportunities" value={num(bookStats.qualified)} icon={<ShieldCheck size={20} />} hint={`${bookStats.warm} warm · ${bookStats.cool} cool`} />
        <KpiCard label="Untapped fee income" value={usd(bookStats.untappedPremium)} accent="accent" icon={<TrendingUp size={20} />} hint="Monthly, if all enroll" />
        <KpiCard label="Protectable balance" value={compactUsd(bookStats.protectableBalance)} icon={<ShieldCheck size={20} />} hint="Across flagged loans" />
        <KpiCard label="Avg opportunity score" value={`${bookStats.avgScore}`} accent="slate" icon={<Flame size={20} />} hint="0–100 propensity" />
      </div>

      {/* Filters */}
      <Card className="mb-4 mt-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search member or loan…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-ca-400 focus:bg-white focus:ring-2 focus:ring-ca-200"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">All branches</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  tier === t ? "bg-white text-ca-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Ranked call list */}
      <Card>
        <CardHeader
          title="Priority call list"
          subtitle="Ranked by opportunity score — work top-down for the best return on dial time."
          action={<span className="pill bg-slate-100 text-slate-600">{num(rows.length)} members</span>}
        />
        <div className="mt-1 divide-y divide-slate-100 border-t border-slate-100">
          {rows.map((loan, i) => (
            <OppRow key={loan.id} loan={loan} rank={i + 1} onCall={() => setActive(loan)} />
          ))}
          {rows.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              No opportunities match these filters.
            </div>
          )}
        </div>
      </Card>

      {active && <CallWizard loan={active} onClose={() => setActive(null)} />}
    </div>
  );
}
