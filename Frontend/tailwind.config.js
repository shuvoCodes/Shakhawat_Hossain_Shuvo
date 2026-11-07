/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: { light: "#F4F3F9", dark: "#0E0C16" },
        surface: { light: "#FFFFFF", dark: "#17141F" },
        primary: { light: "#14121F", dark: "#F5F4FA" },
        secondary: { light: "#6B6878", dark: "#A6A2B8" },
        accent: { light: "#6D5AE6", dark: "#8B7CF6" },
        accent2: { light: "#9B8CFB", dark: "#B4A6FF" },
        success: { light: "#3FBF7F", dark: "#4ADE94" },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
}
