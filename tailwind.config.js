/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-100px 0' },
          '100%': { backgroundPosition: '100px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(90deg, #f4f4f5 0%, #e4e4e7 50%, #f4f4f5 100%)',
      },
    },
  },
  plugins: [],
};
