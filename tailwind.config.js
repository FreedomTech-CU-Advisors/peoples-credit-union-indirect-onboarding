/** @type {import('tailwindcss').Config} */

// Brand tokens resolve through CSS variables written by applyBrand() (Peoples only).
// src/index.css carries the Peoples rgb triplets as a no-flash fallback.
const ramp = (name, steps) =>
  Object.fromEntries(steps.map((s) => [s, `rgb(var(--${name}-${s}) / <alpha-value>)`]));
const FULL = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const ACCENT = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand ramp (Peoples crimson / maroon).
        ca: ramp("ca", FULL),
        // Neutral "ink" ramp — sidebar, body ink, muted text.
        ink: ramp("ink", FULL),
        // Accent ramp (Peoples gold).
        accent: ramp("accent", ACCENT),
      },
      fontFamily: {
        // Stacks live in src/brand/brands.ts (Peoples / Montserrat).
        sans: "var(--font-body)",
        slab: "var(--font-display)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(58, 58, 58, 0.04), 0 1px 3px rgba(58, 58, 58, 0.07)",
        cardhover: "0 8px 24px rgb(var(--ca-500) / 0.14)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
