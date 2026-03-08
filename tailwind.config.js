/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        secondary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        dark: {
          100: "#2A2A38", // border — matches login screen border color
          200: "#1C1C26", // elevated surfaces, inputs
          300: "#13131A", // card / panel backgrounds
          400: "#0A0A0F", // page background — matches login screen bg
          500: "#080810",
          600: "#060609",
          700: "#040406",
          800: "#020203",
          900: "#010101",
        },
        // Game design tokens — used by the Digitask UI redesign (phases 2+).
        // Do not remove existing tokens above; these are additive.
        game: {
          // Dark backgrounds (OLED-safe)
          void:     "#0A0A0F", // deepest background layer
          surface:  "#13131A", // card surfaces
          elevated: "#1C1C26", // modals, dropdowns
          border:   "#2A2A38", // dividers, card borders
          // Brand accent colours
          amber:    "#F59E0B", // primary CTA, evolution glow (same hue as accent-500)
          purple:   "#8B5CF6", // XP bars, magic effects (same hue as secondary-500)
          teal:     "#0D9488", // health, success states
          gold:     "#FFD700", // evolution progress bar, Digivolve CTA highlight
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        // Game typography — Fredoka for display/headings (rounded, playful, matches
        // Digimon aesthetic), Nunito for body text (friendly, readable).
        // Applied selectively via font-heading / font-body classes; not set globally
        // on body until a full audit of admin/dense UI pages is done (Phase 7).
        heading: ["Fredoka", "sans-serif"],
        body:    ["Nunito", "sans-serif"],
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        lg_xl: "1200px",
        xl: "1280px",
        "2xl": "1536px",
        xs: "320px",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "slide-up": {
          "0%":   { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-left": {
          "0%":   { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
      },
      animation: {
        "slide-up":   "slide-up 0.25s ease-out",
        "slide-left": "slide-left 0.25s ease-out",
      },
      boxShadow: {
        soft: "0 2px 10px 0 rgba(0, 0, 0, 0.05)",
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        "card-dark": "0 4px 12px rgba(0, 0, 0, 0.25)",
        // Game glow shadows — used for evolution CTA, XP bars, and Digimon panels.
        // Applied via shadow-amber-glow / shadow-purple-glow / shadow-card-game classes.
        "amber-glow":  "0 0 20px rgba(245, 158, 11, 0.35)",
        "purple-glow": "0 0 12px rgba(139, 92, 246, 0.25)",
        "card-game":   "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
      },
      // Named z-index scale — replaces ad-hoc z-10/z-40/z-50 values scattered across
      // the codebase. Use these semantic names for all new layering work (phases 2+).
      //   z-base:     in-flow content that needs a stacking context
      //   z-sticky:   fixed elements (bottom nav, FAB)
      //   z-dropdown: menus, tooltips, popovers
      //   z-modal:    full dialogs and drawers
      //   z-toast:    notification toasts
      //   z-overlay:  full-screen animations (evolution, battle end)
      zIndex: {
        base:     "1",
        sticky:   "10",
        dropdown: "20",
        modal:    "30",
        toast:    "40",
        overlay:  "50",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
