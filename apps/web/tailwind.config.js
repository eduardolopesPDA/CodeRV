/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--c-bg) / <alpha-value>)",
        surface: "hsl(var(--c-surface) / <alpha-value>)",
        raised: "hsl(var(--c-raised) / <alpha-value>)",
        overlay: "hsl(var(--c-overlay) / <alpha-value>)",
        line: "rgb(232 236 244 / 0.07)",
        "line-strong": "rgb(232 236 244 / 0.14)",
        ink: "hsl(var(--c-ink) / <alpha-value>)",
        muted: "hsl(var(--c-muted) / <alpha-value>)",
        subtle: "hsl(var(--c-subtle) / <alpha-value>)",
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
          950: "#08090C",
        },
        racingblue: {
          300: "#7BD6F3",
          400: "#3FC1E9",
          500: "#0090D4",
          600: "#0072A8",
          700: "#0C2340",
        },
        sev: {
          alta: {
            DEFAULT: "#FF6B6B",
            soft: "rgb(255 107 107 / 0.12)",
            line: "rgb(255 107 107 / 0.32)",
          },
          media: {
            DEFAULT: "#F5A524",
            soft: "rgb(245 165 36 / 0.12)",
            line: "rgb(245 165 36 / 0.32)",
          },
          baixa: {
            DEFAULT: "#8B95A7",
            soft: "rgb(139 149 167 / 0.12)",
            line: "rgb(139 149 167 / 0.28)",
          },
        },
        positive: {
          DEFAULT: "#3DDC97",
          soft: "rgb(61 220 151 / 0.12)",
          line: "rgb(61 220 151 / 0.3)",
        },
        ai: {
          DEFAULT: "#3FC1E9",
          soft: "rgb(63 193 233 / 0.12)",
          line: "rgb(63 193 233 / 0.3)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        card: "14px",
        field: "10px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgb(255 255 255 / 0.03) inset, 0 12px 32px -20px rgb(0 0 0 / 0.9)",
        pop: "0 24px 60px -24px rgb(0 0 0 / 0.85), 0 0 0 1px rgb(255 255 255 / 0.06)",
        glow: "0 0 0 1px rgb(255 128 0 / 0.25), 0 8px 40px -12px rgb(255 128 0 / 0.35)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "fade-up": "fade-up 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 160ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};
