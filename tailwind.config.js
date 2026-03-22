/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        candy: {
          pink: '#ff6b9d',
          purple: '#c56cf0',
          blue: '#48dbfb',
          green: '#1dd1a1',
          yellow: '#feca57',
          orange: '#ff9f43',
          red: '#ff6b6b',
        },
      },
      fontFamily: {
        fredoka: ['Fredoka One', 'cursive'],
        nunito: ['Nunito', 'sans-serif'],
        patrick: ['Patrick Hand', 'cursive'],
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        'pink': '0 10px 30px rgba(255, 107, 157, 0.3)',
        'purple': '0 10px 30px rgba(197, 108, 240, 0.3)',
        'blue': '0 10px 30px rgba(72, 219, 251, 0.3)',
        'green': '0 10px 30px rgba(29, 209, 161, 0.3)',
      },
      animation: {
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spin-in': 'spin-in 0.4s ease-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'spin-in': {
          '0%': { transform: 'rotate(-180deg) scale(0)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 157, 0.7)' },
          '50%': { boxShadow: '0 0 0 15px rgba(255, 107, 157, 0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
