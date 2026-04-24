/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,tsx,ts}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#c8962e',
        accent2: '#c0392b',
      },
    },
  },
  plugins: [],
}
