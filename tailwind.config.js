/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6ebf2',
          100: '#cdd7e5',
          200: '#9bb0cd',
          300: '#6889b5',
          400: '#36629d',
          500: '#043b85', // Base
          600: '#032f6a',
          700: '#022350',
          800: '#011835',
          900: '#001f3f', // Darkest
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
