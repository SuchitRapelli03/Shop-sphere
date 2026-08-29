/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        forest: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22"
        },

        coffee: {
          50: "#FAF7F2",
          100: "#F3E8D5",
          200: "#E8D5BC",
          300: "#D4B08A",
          400: "#B9825B",
          500: "#9A623D",
          600: "#7C4A2D",
          700: "#633820",
          800: "#4A2A19",
          900: "#321B10"
        },

        ice: {
          50: "#F5FBFD",
          100: "#E8F4F8",
          200: "#D4EAF0",
          300: "#B5DCE6",
          400: "#82C4D2",
          500: "#55A8BA",
          600: "#37879B",
          700: "#2D6D7E",
          800: "#285A68",
          900: "#244B57"
        },

        navy: {
          900: "#0F172A",
          950: "#020617"
        }
      },

      boxShadow: {
        soft: "0 10px 35px rgba(15, 23, 42, 0.08)",
        card: "0 8px 30px rgba(6, 78, 59, 0.08)",
        glow: "0 12px 40px rgba(16, 185, 129, 0.16)"
      },

      borderRadius: {
        "4xl": "2rem"
      }
    }
  },

  plugins: []
};