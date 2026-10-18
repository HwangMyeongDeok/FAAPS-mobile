/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // FPT-inspired palette (orange primary, slate neutrals)
        primary: {
          50: "#FFF4ED",
          100: "#FFE5D4",
          200: "#FFC7A8",
          300: "#FFA371",
          400: "#FF7A39",
          500: "#F36F21", // FPT orange
          600: "#D85A11",
          700: "#B5460D",
          800: "#93370E",
          900: "#772E0F",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
