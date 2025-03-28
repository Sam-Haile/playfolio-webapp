/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      dropShadow: {
        'xl': '2px 2px 15px rgba(0, 0, 0, 0.47)',
      },
      colors: {
        customBlack: "#121212",
        footerGray: "#2C2C2C",
        primaryPurple: {
          100: "#F0E5FF",
          200: "#D4B9FF",
          300: "#B78EFF",
          400: "#9C63FF",
          500: "#890CED", // Standard
          600: "#720ABB",
          700: "#5A0892",
          800: "#3F066E",
          900: "#29044A",
        },
        customGray: {
          100: "#FAFAFA",
          200: "#F5F5F5",
          300: "#EEEEEE",
          400: "#E8E8E8",
          500: "#E3E3E3 ", // Standard
          600: "#B8B8B8",
          700: "#8B8B8B",
          800: "#5E5E5E",
          900: "#2C2C2C",
        },
        darkGray: "#515151",
      },
      fontFamily: {
        sans: ["'Source Sans 3'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
