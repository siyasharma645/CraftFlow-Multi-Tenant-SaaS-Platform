/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d872f8',
          500: '#c344ed',
          600: '#a826d0',
          700: '#8d1aab',
          800: '#751889',
          900: '#601870',
        }
      }
    }
  },
  plugins: []
}
