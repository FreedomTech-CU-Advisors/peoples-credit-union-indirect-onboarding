/**
 * Peoples Credit Union theming — this app is locked to Peoples only.
 *
 * `applyBrand()` pushes the palette/fonts into CSS variables that tailwind.config.js
 * reads, so every `ca-*` / `ink-*` / `accent-*` class picks up the Peoples palette.
 * Leftover multi-CU switcher state (`dph-brand`, `?brand=`) is discarded on every load.
 */

import { BRAND, type Brand } from "./brands";

export { BRAND, type Brand } from "./brands";

export const activeBrand: Brand = BRAND;

/** Chart palette — use these instead of hard-coded hexes. */
export const viz = activeBrand.viz;

const LEGACY_BRAND_STORAGE_KEYS = ["dph-brand"] as const;

const hexToTriplet = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Drop inherited Debt Protection Hub switcher state so Canvas (etc.) cannot restore. */
function forgetLegacyBrandSwitch() {
  try {
    for (const key of LEGACY_BRAND_STORAGE_KEYS) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch {
    // private mode / blocked storage
  }

  const url = new URL(window.location.href);
  if (url.searchParams.has("brand")) {
    url.searchParams.delete("brand");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", next);
  }
}

/** Set CSS variables + document chrome. Always Peoples. Call before first render. */
export function applyBrand() {
  forgetLegacyBrandSwitch();

  const brand = BRAND;
  const root = document.documentElement;
  for (const [rampName, ramp] of Object.entries(brand.colors)) {
    for (const [step, hex] of Object.entries(ramp)) {
      root.style.setProperty(`--${rampName}-${step}`, hexToTriplet(hex));
    }
  }
  root.style.setProperty("--font-display", brand.fonts.display);
  root.style.setProperty("--font-body", brand.fonts.body);

  document.title = `${brand.name} · ${brand.productName}`;
  document.querySelector('link[rel="icon"]')?.setAttribute("href", brand.mark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", brand.colors.ca[500]);
  document.querySelector('meta[name="description"]')?.setAttribute("content", brand.metaDescription);
}
