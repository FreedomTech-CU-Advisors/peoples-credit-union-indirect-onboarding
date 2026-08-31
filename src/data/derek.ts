/**
 * Member-phone DEMO fixture — Derek Hale / 2024 Silverado.
 * Not the active credit union's book. Numbers match the live leftover walk
 * (Serra Chevrolet, leftover $31,400, typical insurance $28,911).
 */

export type DemoProductId = "gap" | "debt_protection" | "warranty";

export interface DemoProduct {
  id: DemoProductId;
  name: string;
  sentence: string;
  monthly: number;
  recommended: boolean;
}

export const DEREK = {
  firstName: "Derek",
  lastName: "Hale",
  fullName: "Derek Hale",
  phone: "(989) 555-0133",
  dealer: "Serra Chevrolet",
  dealerFirst: "Serra",
  vehicleYear: 2024,
  vehicleMake: "Chevrolet",
  vehicleModel: "Silverado",
  vehicleTrim: "1500 LT",
  vehicleLabel: "2024 Chevrolet Silverado 1500 LT",
  leftover: 31_400,
  typicalInsurance: 28_911,
  stillOwe: 2_489,
  monthlyPayment: 548.12,
  apr: 6.74,
  remainingTermMonths: 60,
  odometer: "est. 148 mi",
  headline: "Derek, Serra didn't put protection on this Silverado.",
  totaledLine: "If totaled next month you still owe about $2,489.",
  unprotectedLine: "Your $31,400 leftover is not protected.",
  vehicleLine: "2024 Chevrolet Silverado 1500 LT · $548.12/mo · est. 148 mi",
} as const;

export const DEREK_PRODUCTS: DemoProduct[] = [
  {
    id: "gap",
    name: "GAP",
    sentence: "Wrecked: GAP on that $2,489",
    monthly: 14,
    recommended: true,
  },
  {
    id: "debt_protection",
    name: "Debt protection",
    sentence: "Can't work: debt protection $28.89/mo",
    monthly: 28.89,
    recommended: false,
  },
  {
    id: "warranty",
    name: "Warranty",
    sentence: "Shop bill: warranty $34/mo on this Silverado",
    monthly: 34,
    recommended: false,
  },
];

export const WHY_THIS_TRUCK = {
  timing:
    "Typical timing for a 2024 half-ton — not a service record we have. Odometer is estimated (148 miles).",
  totaled:
    "If totaled next month you still owe about $2,489. Typical insurance on this leftover is $28,911.",
  section: "What usually breaks on a half-ton",
  rows: [
    {
      when: "This month",
      miles: "now",
      what: "The truck left the lot. Value drops faster than the loan.",
      tie: "GAP is for the leftover if this Silverado is totaled before insurance catches the balance.",
    },
    {
      when: "18 months",
      miles: "15–20k",
      what: "Half-ton brakes and tires on real work miles.",
      tie: "Warranty is the shop bill after factory coverage — not the leftover loan.",
    },
    {
      when: "3–4 years",
      miles: "36–50k",
      what: "Typical truck battery replacement on a half-ton.",
      tie: "A battery is a shop ticket. Typical timing — we do not have this truck's service record.",
    },
    {
      when: "5 years",
      miles: "60k",
      what: "Typical factory powertrain window ends — transmission, engine.",
      tie: "That is a shop invoice, not a payment. Debt protection does not pay the dealer bay.",
    },
    {
      when: "Any month",
      miles: "now",
      what: "If work stops, the payment is still due.",
      tie: "Debt protection pays this loan at the credit union. It is a monthly fee, not added principal.",
    },
  ],
} as const;

const roundMoney = (n: number) => Math.round(n * 100) / 100;

/** Example quote only — does not change this note. */
export function whatIfPayment(extraMonths: number) {
  const principal = DEREK.leftover;
  const term = DEREK.remainingTermMonths + extraMonths;
  const r = DEREK.apr / 100 / 12;
  const newPayment =
    extraMonths === 0
      ? DEREK.monthlyPayment
      : r === 0
        ? roundMoney(principal / term)
        : roundMoney((principal * r * (1 + r) ** term) / ((1 + r) ** term - 1));
  const oldInterest = DEREK.monthlyPayment * DEREK.remainingTermMonths - principal;
  const newInterest = newPayment * term - principal;
  return {
    extraMonths,
    newPayment,
    extraInterest: roundMoney(Math.max(0, newInterest - oldInterest)),
  };
}
