import { useMemo, useState } from "react";
import { Check, ChevronRight, MapPin, Shield } from "lucide-react";
import { activeBrand } from "../brand";
import {
  DEREK,
  DEREK_PRODUCTS,
  enrollmentTotal,
  LEARN_MORE,
  PROTECTION_BENEFITS,
  type DemoProductId,
} from "../data/derek";
import { usd2 } from "../lib/format";

type Step = "signin" | "offer" | "done";

function money(n: number, withCents = true) {
  const formatted = usd2(n);
  return withCents ? formatted : formatted.replace(/\.00$/, "");
}

function MemberAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const dims = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-[11px]";
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-ca-600 to-ca-800 font-bold text-white ring-2 ring-white ${dims}`}
    >
      {DEREK.initials}
    </div>
  );
}

function VehicleHero({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${compact ? "aspect-[16/9] rounded-xl" : "aspect-[16/10] rounded-none"}`}
    >
      <img
        src={DEREK.vehicleImage}
        alt={DEREK.vehicleImageAlt}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-ink-950/10" />
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-1 shadow-sm ring-1 ring-white/50">
        <img src={activeBrand.mark} alt="" className="h-4 w-4" />
        <span className="text-[10px] font-bold text-ca-800">{activeBrand.shortName}</span>
      </div>
      <div className={`absolute inset-x-0 bottom-0 ${compact ? "p-3" : "p-4"}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-accent-300">
          {compact ? "Your truck" : "Your new truck"}
        </p>
        <p className={`font-slab font-bold tracking-tight text-white ${compact ? "text-[15px]" : "text-[20px]"}`}>
          {DEREK.vehicleYear} {DEREK.vehicleModel}
        </p>
        <p className="mt-0.5 text-[11px] text-white/80">
          {DEREK.vehicleColor} · {DEREK.odometer} · VIN …{DEREK.vinLast6}
        </p>
      </div>
    </div>
  );
}

export default function MemberPhone() {
  const [step, setStep] = useState<Step>("signin");
  const [digits, setDigits] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [selected, setSelected] = useState<DemoProductId[]>(["debt_protection"]);
  const [learnOpen, setLearnOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const total = useMemo(() => enrollmentTotal(selected), [selected]);
  const gapShare = Math.round((DEREK.typicalInsurance / DEREK.loanBalance) * 100);
  const canContinue = digits.length === 4;

  const toggle = (id: DemoProductId) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const verify = () => {
    if (!canContinue) return;
    setSigningIn(true);
    window.setTimeout(() => {
      setSigningIn(false);
      setStep("offer");
    }, 600);
  };

  return (
    <div className="mx-auto flex h-[min(680px,85vh)] w-full max-w-[390px] flex-col overflow-hidden rounded-[2rem] border border-ink-200 bg-white shadow-card">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img
            src={activeBrand.mark}
            alt=""
            className="h-7 w-7 rounded-lg bg-white p-0.5 ring-1 ring-ink-100"
          />
          <div>
            <p className="text-[12px] font-bold text-slate-800">{activeBrand.shortName}</p>
            <p className="text-[10px] text-slate-500">{activeBrand.productName}</p>
          </div>
        </div>
        {step !== "signin" && (
          <div className="flex items-center gap-2">
            <MemberAvatar />
            <span className="text-[11px] font-semibold text-slate-700">{DEREK.firstName}</span>
          </div>
        )}
        {step === "signin" && <span className="pill bg-slate-100 text-slate-600">DEMO</span>}
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          {step === "signin" && (
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ca-50 text-ca-700">
                <Shield size={20} />
              </div>
              <h2 className="mt-4 font-slab text-[26px] font-semibold leading-[1.15] tracking-tight text-slate-900">
                Hi {DEREK.firstName}, confirm it&apos;s you
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-slate-600">
                We found a new auto loan for your {DEREK.vehicleYear} {DEREK.vehicleModel}. Enter
                the last 4 digits of the mobile number on your loan to continue.
              </p>
              <p className="mt-2 text-[13px] text-slate-500">Ends in ••••{DEREK.phoneLast4}</p>

              {canContinue && (
                <div className="mt-5 overflow-hidden rounded-xl border border-ca-100 ring-1 ring-ca-50">
                  <VehicleHero compact />
                  <div className="flex items-center gap-2 bg-ca-50/60 px-3 py-2 text-[11px] text-ca-900">
                    <MapPin size={12} className="shrink-0" />
                    <span>
                      Financed at {DEREK.dealer}, {DEREK.dealerCity} · {DEREK.loanFunded}
                    </span>
                  </div>
                </div>
              )}

              <label className="mt-6 block">
                <span className="sr-only">Last 4 digits</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={digits}
                  onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="• • • •"
                  className="h-14 w-full rounded-xl border border-ink-200 bg-slate-50 text-center text-[28px] font-semibold tracking-[0.35em] text-slate-900 outline-none transition focus:border-ca-400 focus:bg-white focus:ring-2 focus:ring-ca-200"
                />
              </label>

              {!codeSent ? (
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setCodeSent(true)}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-ink-200 text-[14px] font-semibold text-slate-700 hover:border-ca-300 disabled:opacity-40"
                >
                  Text me a code instead
                </button>
              ) : (
                <p className="mt-4 text-center text-[13px] text-emerald-700">
                  Code sent · demo uses any 4 digits
                </p>
              )}

              <button
                type="button"
                disabled={!canContinue || signingIn}
                onClick={verify}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ca-600 text-[15px] font-semibold text-white hover:bg-ca-700 disabled:opacity-40"
              >
                {signingIn ? "Pulling up your loan…" : "Continue"}
                {!signingIn && <ChevronRight size={18} />}
              </button>

              <p className="mt-6 text-center text-[11px] leading-4 text-slate-400">
                Secure member verification · usually under 15 seconds
              </p>
            </div>
          )}

          {step === "offer" && (
            <div className="-mx-4 -mt-5">
              <VehicleHero />

              <div className="space-y-5 px-4 pt-5">
                <div>
                  <p className="text-[13px] font-semibold text-ca-700">
                    Welcome back, {DEREK.firstName}
                  </p>
                  <h2 className="mt-1 font-slab text-[22px] font-semibold leading-[1.15] tracking-tight text-slate-900">
                    Your Raptor didn&apos;t leave {DEREK.dealer} with protection
                  </h2>
                  <p className="mt-2 text-[14px] leading-6 text-slate-600">
                    You financed this truck with {activeBrand.name} on {DEREK.loanFunded}. The
                    dealer didn&apos;t add loan protection — we want to make sure you know what&apos;s
                    available for <span className="font-semibold text-slate-800">your</span> loan.
                  </p>
                </div>

                <div className="rounded-xl border border-ink-100 bg-slate-50/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                        Derek&apos;s loan
                      </p>
                      <p className="mt-1 text-[15px] font-semibold text-slate-800">
                        {money(DEREK.monthlyPayment)}/mo · {money(DEREK.loanBalance, false)} balance
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        {DEREK.apr}% APR · {DEREK.remainingTermMonths} months · acct …
                        {DEREK.accountLast4}
                      </p>
                    </div>
                    <MemberAvatar size="md" />
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-slate-800">
                    Why members protect loans like yours
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {PROTECTION_BENEFITS.map((b) => (
                      <div
                        key={b.title}
                        className="flex gap-3 rounded-xl border border-ink-100 px-3 py-3"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ca-50 text-[10px] font-bold text-ca-700">
                          {b.title.charAt(0)}
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold text-slate-800">{b.title}</p>
                          <p className="mt-0.5 text-[13px] leading-5 text-slate-500">{b.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-ca-100 bg-ca-50/40 p-4">
                  <p className="text-[12px] font-semibold text-ca-800">Optional · GAP for your Raptor</p>
                  <p className="mt-1 text-[13px] leading-5 text-slate-600">
                    High-value trucks depreciate fast. If yours is totaled early, insurance may not
                    cover your full balance — on your loan, that gap is about{" "}
                    {money(DEREK.gapAmount, false)} today.
                  </p>
                  <div className="mt-3">
                    <div className="flex h-2 overflow-hidden rounded-full bg-white">
                      <div className="bg-ink-300/40" style={{ width: `${gapShare}%` }} />
                      <div className="flex-1 bg-ca-600" />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                      <span>Typical insurance {money(DEREK.typicalInsurance, false)}</span>
                      <span>Gap {money(DEREK.gapAmount, false)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {DEREK_PRODUCTS.map((p) => {
                    const on = selected.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggle(p.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                          on
                            ? "border-ca-400 bg-ca-50/50 ring-1 ring-ca-200"
                            : "border-ink-100 bg-white hover:border-ca-200"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            on ? "border-ca-600 bg-ca-600 text-white" : "border-ink-200 bg-white"
                          }`}
                        >
                          {on && <Check size={12} strokeWidth={3} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[15px] font-semibold text-slate-800">{p.name}</p>
                            {p.recommended && (
                              <span className="rounded-md bg-ca-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ca-800">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[13px] leading-5 text-slate-500">{p.tagline}</p>
                        </div>
                        <span className="shrink-0 text-[14px] font-semibold tabular-nums text-slate-800">
                          {money(p.monthly)}/mo
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setLearnOpen((o) => !o)}
                  className="text-[13px] font-medium text-ca-700 underline-offset-4 hover:underline"
                >
                  {learnOpen ? "Hide details" : "Learn more about this offer"}
                </button>
                {learnOpen && (
                  <div className="space-y-3 rounded-xl border border-ink-100 bg-slate-50/50 p-4 text-[13px] leading-5 text-slate-600">
                    <p>{LEARN_MORE.intro}</p>
                    <p>{LEARN_MORE.gap}</p>
                    <p className="text-slate-500">{LEARN_MORE.feeNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "done" && (
            <div>
              <div className="overflow-hidden rounded-xl border border-emerald-100">
                <VehicleHero compact />
              </div>

              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check size={24} strokeWidth={2.5} />
              </div>
              <h2 className="mt-4 font-slab text-[26px] font-semibold tracking-tight text-slate-900">
                Your Raptor is protected, {DEREK.firstName}
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-slate-600">
                Coverage starts on your next billing cycle. We&apos;ll email a summary to{" "}
                {DEREK.email}.
              </p>

              <ul className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-100">
                {selected.map((id) => {
                  const p = DEREK_PRODUCTS.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <li key={id} className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-slate-700">{p.name}</span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {money(p.monthly)}/mo
                      </span>
                    </li>
                  );
                })}
                <li className="flex justify-between bg-slate-50 px-4 py-3 text-sm font-semibold">
                  <span className="text-slate-800">Protection total</span>
                  <span className="tabular-nums text-slate-900">{money(total)}/mo</span>
                </li>
              </ul>

              <p className="mt-4 text-[13px] leading-5 text-slate-500">
                Your loan payment stays {money(DEREK.monthlyPayment)}/mo — protection is a separate
                monthly fee, not added to your loan amount. Cancel anytime.
              </p>

              <p className="mt-6 text-[13px] text-slate-500">
                Questions? Call {DEREK.phone} or visit any {activeBrand.shortName} branch in{" "}
                {DEREK.homeCity.split(",")[0]}.
              </p>
            </div>
          )}
        </div>

        {step === "offer" && (
          <div className="shrink-0 border-t border-ink-100 bg-white px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)]">
            <p className="text-[12px] text-slate-500">
              {selected.length === 0
                ? "Select at least one option"
                : `For ${DEREK.firstName}'s Raptor · not added to loan`}
            </p>
            <p className="text-[22px] font-semibold leading-7 tabular-nums text-slate-900">
              {money(total)}
              <span className="ml-1 text-[12px] font-normal text-slate-500">/mo</span>
            </p>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => setStep("done")}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-ca-600 text-[15px] font-semibold text-white hover:bg-ca-700 disabled:opacity-40"
            >
              Enroll now
            </button>
            <p className="mt-2 text-center text-[11px] leading-4 text-slate-400">
              Example pricing · enroll in under a minute
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
