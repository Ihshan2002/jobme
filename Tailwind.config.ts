import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "loading-bar": {
          "0%":   { width: "0%",   marginLeft: "0%" },
          "50%":  { width: "70%",  marginLeft: "0%" },
          "100%": { width: "100%", marginLeft: "0%" },
        },
      },
      animation: {
        "loading-bar": "loading-bar 2s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;