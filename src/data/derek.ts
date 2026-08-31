/**
 * Member-phone DEMO fixture — Derek Hale, new indirect auto loan member.
 * Financed through a Peoples dealer partner without dealer-sold protection.
 * Not the active credit union's live book.
 */

export type DemoProductId = "debt_protection" | "gap";

export interface DemoProduct {
  id: DemoProductId;
  name: string;
  tagline: string;
  monthly: number;
  recommended: boolean;
}

export interface ProtectionBenefit {
  title: string;
  body: string;
}

export const DEREK = {
  firstName: "Derek",
  lastName: "Hale",
  fullName: "Derek Hale",
  initials: "DH",
  email: "derek.h@email.com",
  phone: "(515) 555-0133",
  phoneLast4: "0133",
  memberSince: "Aug 2025",
  homeCity: "Fort Dodge, IA",
  dealer: "Kruse Motors",
  dealerCity: "Fort Dodge, IA",
  loanFunded: "Aug 12, 2025",
  daysSinceFunded: 18,
  vehicleYear: 2024,
  vehicleMake: "Ford",
  vehicleModel: "F-150 Raptor",
  vehicleTrim: "SuperCrew 4x4",
  vehicleColor: "Iconic Silver",
  vehicleLabel: "2024 Ford F-150 Raptor SuperCrew 4x4",
  vehicleImage: "/derek-raptor-hero.png",
  vehicleImageAlt: "Derek Hale's 2024 Ford F-150 Raptor in Iconic Silver",
  loanBalance: 72_400,
  typicalInsurance: 65_180,
  gapAmount: 7_220,
  monthlyPayment: 1_089.42,
  apr: 6.49,
  remainingTermMonths: 72,
  odometer: "112 mi",
  accountLast4: "4892",
  vinLast6: "7R4821",
} as const;

/** Plain-language benefits — copy references the member's vehicle where it helps. */
export const PROTECTION_BENEFITS: ProtectionBenefit[] = [
  {
    title: "Life",
    body: "If the unexpected happens, your Raptor loan balance is paid — your family isn't left with the payment.",
  },
  {
    title: "Disability",
    body: "Injured and can't work? Your monthly payment is covered while you recover.",
  },
  {
    title: "Job loss",
    body: "Laid off? Involuntary unemployment coverage helps keep your loan current.",
  },
];

export function derekProducts(gapAmount: number): DemoProduct[] {
  const gapLabel = gapAmount.toLocaleString("en-US");
  return [
    {
      id: "debt_protection",
      name: "Member Protection",
      tagline: "Life, disability & job-loss coverage on your Raptor payment",
      monthly: 38.49,
      recommended: true,
    },
    {
      id: "gap",
      name: "GAP coverage",
      tagline: `Covers the $${gapLabel} gap if your Raptor is totaled before insurance catches up`,
      monthly: 22,
      recommended: false,
    },
  ];
}

export const DEREK_PRODUCTS = derekProducts(DEREK.gapAmount);

export const LEARN_MORE = {
  intro:
    "When you finance at the dealer, protection products are optional — many members leave without them. Peoples Credit Union reaches out on new indirect loans so you know what's available and can enroll in minutes, on your phone.",
  gap:
    "New vehicles lose value faster than the loan balance drops. If your Raptor is totaled early, insurance may pay less than you owe — that's the gap. GAP coverage pays the difference so you're not paying out of pocket.",
  feeNote:
    "Protection is a separate monthly fee on your loan — it does not increase your loan amount or change your note. Cancel anytime.",
} as const;

const roundMoney = (n: number) => Math.round(n * 100) / 100;

export function enrollmentTotal(selected: DemoProductId[]) {
  return roundMoney(
    selected.reduce((sum, id) => {
      const p = DEREK_PRODUCTS.find((x) => x.id === id);
      return sum + (p?.monthly ?? 0);
    }, 0),
  );
}
