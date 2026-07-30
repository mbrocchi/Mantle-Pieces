/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#d4af37",
          light: "#f0d878",
          dark: "#a3801f",
        },
        mahogany: {
          DEFAULT: "#5b3a29",
          dark: "#3a2318",
          light: "#7a5138",
        },
        navy: {
          DEFAULT: "#161b2e",
          light: "#232a45",
        },
      },
    },
  },
  plugins: [],
};
