/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,tsx,ts}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#f0c040',
        accent2: '#e05a5a',
      },
    },
  },
  plugins: [],
}
