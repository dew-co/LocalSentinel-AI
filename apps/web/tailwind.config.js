/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: "#050814",
          panel: "#0b1222",
          border: "#1c2b46",
          cyan: "#35e7ff",
          blue: "#4d8dff",
          violet: "#9b5cff",
          rose: "#ff477e",
          amber: "#f8c14f",
          green: "#43f0a4"
        }
      },
      boxShadow: {
        core: "0 0 48px rgba(53, 231, 255, 0.3)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

