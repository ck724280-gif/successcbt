import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f4f6f8",
        foreground: "#1f242e",
        testbook: {
          sidebar: "#1f242e",
          sidebarHover: "#282e3b",
          sidebarActive: "#141820",
          teal: "#0097a7",
          tealDark: "#0e6065",
          tealLight: "#e0f7fa",
          cyan: "#00baf2",
          cyanHover: "#00a3d4",
          cyanLight: "#e5f7fd",
          green: "#22c55e",
          greenLight: "#dcfce7",
          greenDark: "#15803d",
          red: "#ef4444",
          redLight: "#fee2e2",
          yellow: "#eab308",
          yellowLight: "#fef9c3",
          purple: "#6366f1",
          cardHeader: "#f9fafb",
          border: "#e5e7eb",
        },
      },
    },
  },
  plugins: [],
};
export default config;
