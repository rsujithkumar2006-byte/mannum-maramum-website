/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#0E2A1E",
          900: "#153A28",
          800: "#1B4332",
          700: "#245C41",
          600: "#2D6A4F",
        },
        leaf: {
          500: "#52B788",
          400: "#74C69D",
          300: "#95D5B2",
        },
        clay: {
          600: "#A6754A",
          500: "#B08968",
          400: "#C9A27B",
        },
        cream: {
          100: "#FBF8F1",
          200: "#F5EFE1",
        },
        ink: "#122017",
      },
      fontFamily: {
        display: ["Fraunces", "Noto Serif Tamil", "serif"],
        body: ["Manrope", "Noto Sans Tamil", "sans-serif"],
      },
      borderRadius: {
        soft: "1.25rem",
      },
    },
  },
  plugins: [],
}
