/**
 * Peoples Credit Union brand for the Indirect Onboarding proof-of-concept.
 *
 * Palette read off peoples-credit-union.com: logo crimson #96262C + grey ring #76777A,
 * deep maroon chrome #3E0515 / #4C0418, brick #811D20, gold accent #D69746.
 * Webster City, IA (central Iowa, area code 515).
 */

type Ramp = Record<number, string>;

export interface BrandBranch {
  id: string;
  name: string;
  city: string;
}

export interface Brand {
  name: string;
  shortName: string;
  mark: string;
  productName: string;
  goalLead: string;
  goalHighlight: string;
  metaDescription: string;
  colors: { ca: Ramp; ink: Ramp; accent: Ramp };
  fonts: { display: string; body: string };
  viz: {
    primary: string;
    secondary: string;
    tertiary: string;
    tint: string;
    faint: string;
    wash: string;
  };
  branches: BrandBranch[];
  areaCodes: string[];
}

export const BRAND: Brand = {
  name: "Peoples Credit Union",
  shortName: "Peoples",
  mark: "/peoples-mark.svg",
  productName: "Indirect Onboarding",
  goalLead: "member-owned since 1936 —",
  goalHighlight: "People Helping People",
  metaDescription:
    "Peoples Credit Union Indirect Onboarding — welcome desk and member self-serve for indirect loan debt protection enrollment across central Iowa.",
  colors: {
    ca: {
      50: "#fcf4f4", 100: "#f9e6e6", 200: "#f2cacb", 300: "#e5a2a4", 400: "#d1706f",
      500: "#96262c", 600: "#811d20", 700: "#6b1a1d", 800: "#4c0418", 900: "#3e0515",
      950: "#2a0410",
    },
    ink: {
      50: "#f6f6f6", 100: "#ececec", 200: "#dcdcdd", 300: "#c1c2c3", 400: "#898a8d",
      500: "#76777a", 600: "#5c5d60", 700: "#47484a", 800: "#333333", 900: "#262627",
      950: "#161617",
    },
    accent: {
      50: "#fdf8ef", 100: "#f9edd4", 200: "#f2d9a5", 300: "#e9bf6f",
      400: "#e0a84f", 500: "#d69746", 600: "#bd7d34", 700: "#9c622c", 800: "#7e4e28",
      900: "#684123",
    },
  },
  fonts: {
    display: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
    body:
      '"Montserrat", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  viz: {
    primary: "#96262c", secondary: "#4c0418", tertiary: "#d69746",
    tint: "#d1706f", faint: "#f2cacb", wash: "#fcf4f4",
  },
  branches: [
    { id: "b1", name: "Webster City (HQ)", city: "Webster City, IA" },
    { id: "b2", name: "Fort Dodge", city: "Fort Dodge, IA" },
    { id: "b3", name: "Lehigh", city: "Lehigh, IA" },
    { id: "b4", name: "Hamilton County", city: "Webster City, IA" },
    { id: "b5", name: "Webster County", city: "Fort Dodge, IA" },
    { id: "b6", name: "Boone", city: "Boone, IA" },
    { id: "b7", name: "Ames", city: "Ames, IA" },
    { id: "b8", name: "Iowa Falls", city: "Iowa Falls, IA" },
  ],
  areaCodes: ["515", "641"],
};
