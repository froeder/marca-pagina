/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f0',
          100: '#fbe8de',
          200: '#f7d0bd',
          300: '#f1ab8e',
          400: '#e87c56',
          500: '#e0592c',
          600: '#d2411e',
          700: '#af3218',
          800: '#8c2b1a',
          900: '#722619',
          950: '#3e110b',
        },
        paper: {
          50: '#fbfaf8',
          100: '#f5f2eb',
          200: '#ebe4d5',
          300: '#ded2bb',
          400: '#cebca0',
          500: '#beaa88',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
