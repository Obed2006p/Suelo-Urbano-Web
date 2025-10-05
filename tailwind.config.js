/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./Header.tsx",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-float': 'bounce-float 3s ease-in-out infinite 1s',
        'pulse-shadow': 'pulse-shadow 2.5s infinite 1.5s',
      },
      keyframes: {
        'bounce-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-shadow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
          '70%': { boxShadow: '0 0 0 12px rgba(34, 197, 94, 0)' },
        }
      }
    },
  },
  plugins: [],
}
