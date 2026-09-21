/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        papaya: {
          50: "#FFF3E6",
          100: "#FFE0BF",
          200: "#FFC680",
          300: "#FFAB4D",
          400: "#FF9426",
          500: "#FF8000",
          600: "#E66E00",
          700: "#B85800",
          800: "#8A4200",
          900: "#5C2C00",
        },
        carbon: {
          50: "#F2F3F5",
          100: "#E1E3E8",
          200: "#C3C7D1",
          300: "#9AA0AF",
          400: "#6B7280",
          500: "#454B57",
          600: "#2E323C",
          700: "#1F222A",
          800: "#15171D",
          900: "#0B0C10",
        },
        racingblue: {
          400: "#3FC1E9",
          500: "#0090D4",
          600: "#0072A8",
          700: "#0C2340",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
