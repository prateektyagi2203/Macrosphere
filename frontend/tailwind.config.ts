import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F7FA",
        card: "#FFFFFF",
        border: "#D9E2F2",
        primary: "#2563EB",
        positive: "#22C55E",
        negative: "#EF4444",
        warning: "#F59E0B",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
      },
      fontSize: {
        "page-title": "36px",
        "section-title": "24px",
        "card-heading": "14px",
        "card-metric": "40px",
        body: "14px",
        caption: "12px",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [forms],
};

export default config;
