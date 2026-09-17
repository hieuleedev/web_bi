/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#b78978', // Rose gold / warm boutique accent
          600: '#9d6d5c',
          700: '#7e5344',
          800: '#674438',
          900: '#543930',
          950: '#2d1c16',
        },
        gold: {
          400: '#fbbf24',
          500: '#d97706',
          600: '#b45309',
        },
        dark: {
          800: '#1e2022',
          900: '#121316',
          950: '#0a0a0c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
