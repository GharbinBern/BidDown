/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,tsx,ts}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#2563eb',
        accent2: '#dc2626',
      },
    },
  },
  plugins: [],
}
