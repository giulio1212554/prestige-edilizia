import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#1a1a1a",
          50: "#f7f7f7",
          100: "#e3e3e3",
          200: "#c8c8c8",
          300: "#a4a4a4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#1a1a1a",
          950: "#0d0d0d",
        },
        warmgray: {
          DEFAULT: "#8a8175",
          50: "#f7f6f4",
          100: "#edeae6",
          200: "#d9d4cc",
          300: "#c0b8ac",
          400: "#a69b8c",
          500: "#8a8175",
          600: "#6f675c",
          700: "#59534a",
          800: "#4a453e",
          900: "#3f3b35",
        },
        bronze: {
          DEFAULT: "#b08d57",
          50: "#f9f5ef",
          100: "#f1e8d9",
          200: "#e3d0b3",
          300: "#d2b288",
          400: "#c29565",
          500: "#b08d57",
          600: "#9a7345",
          700: "#7d5a39",
          800: "#684a33",
          900: "#573e2c",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
