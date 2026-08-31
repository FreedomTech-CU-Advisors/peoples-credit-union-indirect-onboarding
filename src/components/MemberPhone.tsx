import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DEREK,
  DEREK_PRODUCTS,
  WHY_THIS_TRUCK,
  whatIfPayment,
  type DemoProductId,
} from "../data/derek";
import { usd, usd2 } from "../lib/format";

type Step = "leftover" | "add" | "enrolled";

const TERM_OPTIONS = [0, 6, 12, 18] as const;

function money(n: number, cents = true) {
  return cents ? usd2(n) : usd(n);
}

export default function MemberPhone() {
  const { search } = useLocation();
  const [step, setStep] = useState<Step>("leftover");
  const [selected, setSelected] = useState<DemoProductId[]>([]);
  const [whyOpen, setWhyOpen] = useState(false);
  const [extraMonths, setExtraMonths] = useState(0);

  const added = useMemo(
    () =>
      selected.reduce((sum, id) => {
        const p = DEREK_PRODUCTS.find((x) => x.id === id);
        return sum + (p?.monthly ?? 0);
      }, 0),
    [selected],
  );
  const due = Math.round((DEREK.monthlyPayment + added) * 100) / 100;
  const quote = whatIfPayment(extraMonths);
  const payoutShare = Math.round((DEREK.typicalInsurance / DEREK.leftover) * 100);

  const toggle = (id: DemoProductId) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  return (
    <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-ink-200 bg-white shadow-card">
      <header className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-800">{DEREK.fullName}</p>
          <p className="text-[11px] text-slate-500">
            {DEREK.vehicleYear} {DEREK.vehicleMake} {DEREK.vehicleModel}
          </p>
        </div>
        <span className="pill bg-slate-100 text-slate-600">DEMO</span>
      </header>

      <div className="relative min-h-[640px] px-4 py-6">
        {step === "leftover" && (
          <div>
            <h2 className="font-slab text-[26px] font-semibold leading-[1.15] tracking-tight text-slate-900">
              {DEREK.headline}
            </h2>
            <p className="mt-8 text-[12px] text-slate-500">leftover</p>
            <p className="mt-1 text-[52px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
              {money(DEREK.leftover, false)}
            </p>
            <div className="mt-5">
              <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="bg-ink-400/30" style={{ width: `${payoutShare}%` }} />
                <div className="flex-1 bg-ca-600" />
              </div>
              <div className="mt-2 flex justify-between gap-3 text-[11px] text-slate-500">
                <span>
                  Typical insurance <span className="tabular-nums">{money(DEREK.typicalInsurance, false)}</span>
                </span>
                <span>
                  Gap <span className="tabular-nums">{money(DEREK.stillOwe, false)}</span>
                </span>
              </div>
            </div>
            <p className="mt-5 text-[15px] leading-6 text-slate-700">{DEREK.totaledLine}</p>
            <p className="mt-2 text-[13px] leading-5 text-slate-500">{DEREK.unprotectedLine}</p>
            <p className="mt-6 text-[12px] leading-5 text-slate-500">{DEREK.vehicleLine}</p>
            <button
              type="button"
              onClick={() => setStep("add")}
              className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-ca-600 text-[15px] font-semibold text-white hover:bg-ca-700"
            >
              Add protection
            </button>
            <div className="mt-8 border-t border-ink-100 pt-4">
              <button
                type="button"
                onClick={() => setWhyOpen((o) => !o)}
                className="text-[13px] text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
              >
                Why this truck
              </button>
              {whyOpen && (
                <div className="mt-4 space-y-5">
                  <p className="text-[12px] leading-5 text-slate-500">{WHY_THIS_TRUCK.timing}</p>
                  <p className="text-[13px] leading-5 text-slate-600">{WHY_THIS_TRUCK.totaled}</p>
                  <section>
                    <p className="text-[13px] font-semibold text-slate-800">{WHY_THIS_TRUCK.section}</p>
                    <ul className="mt-2 space-y-3">
                      {WHY_THIS_TRUCK.rows.map((row) => (
                        <li key={row.when} className="text-[12px] leading-5 text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {row.when}
                            {row.miles ? ` · ${row.miles}` : ""}
                            <span className="font-normal text-slate-400"> · typical</span>
                          </span>
                          <span className="mt-0.5 block">{row.what}</span>
                          <span className="mt-0.5 block text-slate-500">{row.tie}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <p className="text-[13px] font-semibold text-slate-800">Lower the payment</p>
                    <p className="mt-1 text-[12px] text-slate-500">
                      Example quote only. Does not change this note.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TERM_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setExtraMonths(m)}
                          className={`h-8 rounded-lg border px-2.5 text-[12px] tabular-nums ${
                            extraMonths === m
                              ? "border-ca-600 bg-ca-600 text-white"
                              : "border-ink-200 text-slate-600 hover:border-ca-300"
                          }`}
                        >
                          {m === 0 ? `Keep ${DEREK.remainingTermMonths}` : `+${m} mo`}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[13px] tabular-nums text-slate-700">
                      {money(quote.newPayment)}/mo · extra interest {money(quote.extraInterest)} ·{" "}
                      {DEREK.apr.toFixed(2)}%
                    </p>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "add" && (
          <div className="pb-44">
            <button
              type="button"
              onClick={() => setStep("leftover")}
              className="text-[12px] text-slate-500 hover:text-slate-800"
            >
              {DEREK.headline}
            </button>
            <h2 className="mt-1 font-slab text-[24px] font-semibold tracking-tight text-slate-900">
              Add protection
            </h2>
            <p className="mt-2 text-[13px] text-slate-500">
              One job each. Monthly fee on this leftover — not added principal.
            </p>
            <div className="mt-5 space-y-2.5">
              {DEREK_PRODUCTS.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 bg-slate-50/50 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-slate-800">{p.name}</p>
                        {p.recommended && (
                          <span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-5 text-slate-500">{p.sentence}</p>
                      <p className="mt-1 text-[13px] font-semibold tabular-nums text-slate-800">
                        {money(p.monthly)}/mo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      className={`shrink-0 rounded-lg border px-3 py-1.5 text-[13px] font-semibold ${
                        on
                          ? "border-ca-600 bg-ca-600 text-white"
                          : "border-ink-200 bg-white text-slate-700 hover:border-ca-300"
                      }`}
                    >
                      {on ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === "enrolled" && (
          <div>
            <h2 className="font-slab text-[28px] font-semibold tracking-tight text-slate-900">
              You are enrolled.
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-slate-500">
              This {DEREK.vehicleModel} note did not change. Fees start next cycle. Cancel anytime.
            </p>
            <ul className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-100">
              {selected.map((id) => {
                const p = DEREK_PRODUCTS.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <li key={id} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-slate-700">{p.name}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{money(p.monthly)}</span>
                  </li>
                );
              })}
              <li className="flex justify-between px-4 py-3 text-sm font-semibold">
                <span className="text-slate-800">Protection / mo</span>
                <span className="tabular-nums text-slate-900">{money(added)}</span>
              </li>
            </ul>
            <p className="mt-4 text-[13px] text-slate-500">
              Leftover still {money(DEREK.leftover, false)}. The note did not change.
            </p>
            <p className="mt-6 text-sm text-slate-500">Questions? {DEREK.phone}</p>
            <Link
              to={{ pathname: "/outreach", search }}
              className="mt-6 inline-flex text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
            >
              Open the ops desk
            </Link>
          </div>
        )}

        {step === "add" && (
          <div className="absolute inset-x-0 bottom-0 border-t border-ink-100 bg-white px-4 py-3">
            <p className="text-[12px] text-slate-500">
              {money(DEREK.monthlyPayment)} + {money(added)}
            </p>
            <p className="text-[22px] font-semibold leading-7 tabular-nums text-slate-900">
              {money(due)}
              <span className="ml-1 text-[12px] font-normal text-slate-500">/mo</span>
            </p>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => setStep("enrolled")}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-ca-600 text-[15px] font-semibold text-white hover:bg-ca-700 disabled:opacity-40"
            >
              Enroll
            </button>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              Example pricing — not a quote. Monthly fee, not added principal. We never cancel a
              dealer product or touch dealer reserve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
