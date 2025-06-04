import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          electric: "#7DF9FF",   // primary
          white:   "#FFFFFF",
          gray:    "#4D4D4F",
          black:   "#000000",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Meutas", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), 
    require("tailwind-scrollbar")
  ],
};

export default config; 