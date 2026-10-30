/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // shadcn-style HSL tokens, defined as RGB hex so NativeWind
        // can compile them with `class` variants (HSL doesn't work with
        // darkMode: 'class' in NativeWind v4 out of the box).
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "#F36F21",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 47.4% 11.2%)",
        primary: {
          // FPT orange. DEFAULT === brand-500 (#F36F21) so `bg-primary` and
          // `bg-primary-500` render the exact same shade.
          DEFAULT: "#F36F21",
          foreground: "#FFFFFF",
          50: "#FFF4ED",
          100: "#FFE5D4",
          200: "#FFC7A8",
          300: "#FFA371",
          400: "#FF7A39",
          500: "#F36F21",
          600: "#D85A11",
          700: "#B5460D",
          800: "#93370E",
          900: "#772E0F",
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        accent: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        // FPT orange brand — kept as the *primary* scale
        brand: {
          50: "#FFF4ED",
          100: "#FFE5D4",
          200: "#FFC7A8",
          300: "#FFA371",
          400: "#FF7A39",
          500: "#F36F21",
          600: "#D85A11",
          700: "#B5460D",
          800: "#93370E",
          900: "#772E0F",
        },

        // ── FAAPS semantic tokens ────────────────────────────────────────────
        // A warm "paper" ground (FPT orange's own material), white surfaces,
        // warm hairlines and one warm-black ink. The orange accent stays
        // reserved for data and the single primary action.
        ground: { DEFAULT: "#FAF7F4", dark: "#12100E" },
        surface: { DEFAULT: "#FFFFFF", dark: "#1B1815" },
        raised: { DEFAULT: "#F2EDE7", dark: "#241F1B" },
        line: { DEFAULT: "#EAE1D8", dark: "#302A24" },
        rule: { DEFAULT: "#F3EDE6", dark: "#262019" },
        ink: { DEFAULT: "#191512", dark: "#F7F2EC" },
        "ink-muted": { DEFAULT: "#6A6058", dark: "#A79C93" },
        "ink-faint": { DEFAULT: "#8B8178", dark: "#7D746C" },
        "brand-tint": { DEFAULT: "#FFF1E7", dark: "#2E1C0E" },
        "brand-ink": { DEFAULT: "#B5460D", dark: "#FFA371" },
      },
      fontFamily: {
        // Instrument Sans — the dealt typeface. Every weight is its own
        // family because expo-font registers one family per font file.
        sans: ["InstrumentSans_400Regular"],
        "sans-medium": ["InstrumentSans_500Medium"],
        "sans-semibold": ["InstrumentSans_600SemiBold"],
        "sans-bold": ["InstrumentSans_700Bold"],
        // Instrument Serif — the greeting only.
        serif: ["InstrumentSerif_400Regular"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};
