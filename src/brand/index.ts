/**
 * Peoples Credit Union theming.
 *
 * `applyBrand()` pushes the palette/fonts into CSS variables that tailwind.config.js
 * reads, so every `ca-*` / `ink-*` / `accent-*` class picks up the Peoples palette.
 */

import { BRAND, type Brand } from "./brands";

export { BRAND, type Brand } from "./brands";

export const activeBrand: Brand = BRAND;

/** Chart palette — use these instead of hard-coded hexes. */
export const viz = activeBrand.viz;

const hexToTriplet = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Set CSS variables + document chrome. Call before first render. */
export function applyBrand(brand: Brand = activeBrand) {
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
