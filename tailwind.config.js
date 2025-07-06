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
        shimmer: 'shimmer 1.5s infinite linear',
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(to right, #f3f4f6 0%, #e5e7eb 20%, #f3f4f6 40%)',
      },
    },
  },
  plugins: [],
};
