import type { Config } from "tailwindcss";

/**
 * Zebite design tokens — same token language as the Zhevion parent studio
 * (paper/ink base, one accent world). Zebite is the "grocery" world: forest
 * green + lime. Ported from landing_page_zhevion/tailwind.config.ts.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Studio base (neutral, premium)
        graphite: {
          DEFAULT: "#0E0F10",
          900: "#0E0F10",
          800: "#16181A",
          700: "#1E2124",
          600: "#282C30",
        },
        cream: "#F5F5F3",
        muted: "#9A9A97",
        // Light canvas — the home page's ground.
        paper: {
          DEFAULT: "#F2F1EC",
          deep: "#E8E7E0",
        },
        ink: {
          DEFAULT: "#0D2E21",
          soft: "#4A554E",
          faint: "rgba(13, 46, 33, 0.42)",
          rule: "rgba(13, 46, 33, 0.12)",
        },
        // Grocery accent world (Zebite's own)
        forest: {
          900: "#0D2E21",
          700: "#123B2A",
          500: "#1B5C41",
        },
        lime: {
          DEFAULT: "#B5E34D",
          ink: "#16290B",
        },
        // Zeb's own signature accent — used sparingly, matches the mascot
        volt: {
          DEFAULT: "#7C5CFF",
          deep: "#5B34E0",
          soft: "#A88BFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      letterSpacing: {
        tightest: "-0.045em",
        // The display wordmark is set far tighter than body copy: at 15vw the
        // default sidebearings open gaps you can park a car in.
        display: "-0.055em",
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        "reveal-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "float-hand": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-33.3333%)" },
        },
      },
      animation: {
        "reveal-up": "reveal-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-soft": "float-soft 7s ease-in-out infinite",
        "float-hand": "float-hand 7s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
