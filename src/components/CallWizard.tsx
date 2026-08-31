import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  PartyPopper,
  Phone,
  PhoneOff,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  COVERAGES,
  branchById,
  coverageLabel,
  officerById,
  type CoverageKey,
} from "../data/mock";
import { premiumFor, signalTone, type BookLoan } from "../data/book";
import { num, relativeDays, usd, usd2 } from "../lib/format";
import { activeBrand } from "../brand";
import { coverageColors } from "../lib/metrics";
import { Avatar } from "./ui";

type Outcome = "enrolled" | "callback" | "declined" | "noanswer";

const STEPS = ["Prepare", "Recommend", "Handle objections", "Wrap up"];

const OBJECTIONS = [
  {
    q: "“I can’t afford another monthly charge.”",
    a: "Frame it per day: this is about the price of a coffee a week to wipe out the balance if the unexpected happens. Compare to the monthly payment they’d still owe with no income.",
  },
  {
    q: "“I already have life insurance.”",
    a: "Great — this is loan-specific and pays the lender directly, so their policy stays intact for the family. It also covers disability and job loss, which life insurance won’t.",
  },
  {
    q: "“Let me think about it.”",
    a: "Totally fair. The benefit is we can add it today with no medical exam while the loan is active. Want me to start it now and you can cancel within 30 days, no cost, if you change your mind?",
  },
  {
    q: "“I’m healthy and have a stable job.”",
    a: "That’s exactly when it’s cheapest to lock in. Most claims come from accidents and involuntary job loss — things that don’t care how healthy we are today.",
  },
];

export default function CallWizard({ loan, onClose }: { loan: BookLoan; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<CoverageKey[]>(loan.recommendedCoverages);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [notes, setNotes] = useState("");

  const officer = officerById(loan.officerId);
  const branch = branchById(loan.branchId);
  const livePremium = useMemo(
    () => premiumFor(selected, loan.currentBalance),
    [selected, loan.currentBalance]
  );

  const toggle = (k: CoverageKey) =>
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-slate-50 shadow-2xl animate-fade-in sm:h-[88vh] sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-ca-800 to-ca-950 px-5 py-4 text-white sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-400 text-ca-900">
              <Phone size={20} />
            </span>
            <div>
              <div className="text-sm font-bold">Guided protection call</div>
              <div className="text-xs text-ca-100/80">
                {loan.memberName} · {loan.phone}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-white/80 hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-5 py-3 sm:px-7">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  i === step
                    ? "bg-ca-600 text-white"
                    : i < step
                    ? "text-accent-700"
                    : "text-slate-400"
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                    i < step ? "bg-accent-500 text-white" : i === step ? "bg-white/25" : "bg-slate-200"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Body: context rail + step content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* context rail */}
          <aside className="shrink-0 space-y-4 overflow-y-auto border-b border-slate-200 bg-white p-5 lg:w-72 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <Avatar name={loan.memberName} hue={(loan.score * 7) % 360} />
              <div>
                <div className="font-bold text-slate-800">{loan.memberName}</div>
                <div className="text-[11px] text-slate-400">
                  Member {loan.memberId} · {loan.memberSinceYears}y
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { k: "Loan", v: loan.loanType },
                { k: "Balance", v: usd(loan.currentBalance) },
                { k: "Rate", v: `${loan.rate}%` },
                { k: "Payment", v: `${usd(loan.monthlyPayment)}/mo` },
                { k: "Term left", v: `${loan.remainingMonths} mo` },
                { k: "Products", v: num(loan.products) },
              ].map((s) => (
                <div key={s.k} className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">{s.k}</div>
                  <div className="font-bold text-slate-700">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-ca-50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ca-700">
                <CalendarClock size={13} /> Best window
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">{loan.bestCallWindow}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                {loan.lastContactDaysAgo ? `Last contact ${relativeDays(loan.lastContactDaysAgo)}` : "No prior contact"}
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Servicing: {officer.name} · {branch.name}
            </div>
          </aside>

          {/* step content */}
          <section className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Why call now</h3>
                  <p className="text-sm text-slate-500">
                    Signals our core scan flagged on this loan — lead with these.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {loan.signals.map((sig) => {
                    const tone = signalTone[sig.kind];
                    return (
                      <div key={sig.label} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className={`pill ${tone.cls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /> {tone.label}
                        </div>
                        <div className="mt-2 text-sm font-bold text-slate-800">{sig.label}</div>
                        <div className="mt-0.5 text-xs leading-snug text-slate-500">{sig.detail}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-xl border border-accent-200 bg-accent-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-accent-800">
                    <Sparkles size={16} /> Suggested opener
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    “Hi {loan.memberName.split(" ")[0]}, this is {officer.name.split(" ")[0]} from {activeBrand.name}.
                    I was reviewing your {loan.loanType.toLowerCase()} loan and noticed it isn’t protected
                    yet. I want to make sure your family wouldn’t be stuck with the{" "}
                    {usd(loan.currentBalance)} balance if something unexpected happened — do you have two
                    minutes?”
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Build the recommendation</h3>
                  <p className="text-sm text-slate-500">
                    Toggle coverages — the quote updates live based on the {usd(loan.currentBalance)} balance.
                  </p>
                </div>
                <div className="space-y-2">
                  {COVERAGES.map((c) => {
                    const on = selected.includes(c.key);
                    const already = loan.currentCoverages.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        onClick={() => !already && toggle(c.key)}
                        disabled={already}
                        className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                          already
                            ? "cursor-not-allowed border-slate-100 bg-slate-50"
                            : on
                            ? "border-ca-300 bg-ca-50 ring-2 ring-ca-200"
                            : "border-slate-200 bg-white hover:border-ca-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-9 w-9 place-items-center rounded-lg text-white"
                            style={{ background: on || already ? coverageColors[c.key] : "#cbd5e1" }}
                          >
                            <ShieldCheck size={17} />
                          </span>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{c.label}</div>
                            <div className="text-[11px] text-slate-500">
                              {already
                                ? "Already enrolled"
                                : c.key === "life"
                                ? "Cancels the balance on death"
                                : c.key === "disability"
                                ? "Covers payments if disabled"
                                : "Covers payments during involuntary job loss"}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`pill ${
                            already
                              ? "bg-slate-200 text-slate-500"
                              : on
                              ? "bg-accent-100 text-accent-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {already ? "On file" : on ? "Added" : "Add"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-ca-700 to-ca-900 p-5 text-white">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-ca-100/80">
                      New monthly premium
                    </div>
                    <div className="text-3xl font-extrabold">{usd2(livePremium)}</div>
                    <div className="text-[11px] text-accent-300">
                      ≈ {usd2(livePremium / 30)} / day · protects {usd(loan.currentBalance)}
                    </div>
                  </div>
                  <div className="text-right text-xs text-ca-100/80">
                    {selected.length} coverage{selected.length === 1 ? "" : "s"} selected
                    <div className="mt-1 flex flex-wrap justify-end gap-1">
                      {selected.map((k) => (
                        <span
                          key={k}
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: coverageColors[k] }}
                        >
                          {coverageLabel(k)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Handle objections</h3>
                  <p className="text-sm text-slate-500">Tap a concern to see a suggested response.</p>
                </div>
                <div className="space-y-2">
                  {OBJECTIONS.map((o) => (
                    <details key={o.q} className="group rounded-xl border border-slate-200 bg-white p-4">
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800">
                        {o.q}
                        <ChevronRight size={16} className="text-slate-400 transition group-open:rotate-90" />
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{o.a}</p>
                    </details>
                  ))}
                </div>
                <div className="rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-slate-700">
                  <span className="font-bold text-accent-800">Trial close:</span> “If we could fit this into
                  your budget at {usd2(livePremium)} a month, is there any reason we wouldn’t want your loan
                  protected today?”
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Log the outcome</h3>
                  <p className="text-sm text-slate-500">Disposition this call so the next steps fire automatically.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "enrolled", label: "Enrolled", icon: CheckCircle2, cls: "border-accent-300 bg-accent-50 text-accent-800" },
                    { id: "callback", label: "Callback scheduled", icon: CalendarClock, cls: "border-sky-300 bg-sky-50 text-sky-700" },
                    { id: "declined", label: "Not interested", icon: CircleSlash, cls: "border-rose-300 bg-rose-50 text-rose-700" },
                    { id: "noanswer", label: "No answer", icon: PhoneOff, cls: "border-slate-300 bg-slate-50 text-slate-600" },
                  ] as const).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setOutcome(o.id)}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition ${
                        outcome === o.id ? o.cls : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <o.icon size={18} /> {o.label}
                    </button>
                  ))}
                </div>

                {outcome === "enrolled" && (
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 p-4 text-white animate-fade-in">
                    <PartyPopper size={28} />
                    <div>
                      <div className="font-extrabold">Nice close! {usd2(livePremium)}/mo added.</div>
                      <div className="text-xs text-accent-50">
                        Enrollment packet will auto-send. {usd(loan.currentBalance)} now protected.
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Call notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Capture what was discussed, member sentiment, and any follow-up…"
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-ca-400 focus:ring-2 focus:ring-ca-200"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 sm:px-7">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-1 rounded-xl bg-ca-600 px-5 py-2 text-sm font-semibold text-white hover:bg-ca-700"
            >
              {step === 1 ? "Present & handle objections" : step === 2 ? "Close the call" : "Continue"}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={!outcome}
              className="flex items-center gap-1 rounded-xl bg-ca-600 px-5 py-2 text-sm font-semibold text-white hover:bg-ca-700 disabled:opacity-40"
            >
              Save & close
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
