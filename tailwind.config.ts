import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#0B1020",
        dusk: "#141B34",
        duskLight: "#1E2748",
        neon: "#4CF3D6",
        amber: "#FFB13C",
        magenta: "#FF5C8A",
        mist: "#C9D2F0",
        mistDim: "#7C87B8",
      },
      fontFamily: {
        display: ["var(--font-pixel)", "monospace"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 12px rgba(76,243,214,0.55), 0 0 40px rgba(76,243,214,0.25)",
        amber: "0 0 12px rgba(255,177,60,0.55), 0 0 40px rgba(255,177,60,0.2)",
      },
      keyframes: {
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 40px" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        scan: "scan 1.2s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
