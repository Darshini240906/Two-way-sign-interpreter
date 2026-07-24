/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D10",
        panel: "#12151A",
        line: "#22262E",
        paper: "#F3F1EC",
        muted: "#8A8F98",
        sign: {
          DEFAULT: "#4FD1C5",
          dim: "#1E3A38",
        },
        speech: {
          DEFAULT: "#8B7FF0",
          dim: "#2C2750",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
