/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tennis: {
          yellow: '#f59e0b',
          gold: '#eab308',
          accent: '#facc15',
          court: '#0f172a',
          dark: '#090d16',
          surface: '#111827',
          card: '#151d30',
          border: '#1f293d',
        }
      }
    },
  },
  plugins: [],
}
