/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['General Sans', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        background: '#0B0B0B',
        secondary: '#121212',
        card: 'rgba(255, 255, 255, 0.03)',
        primaryText: '#FFFFFF',
        secondaryText: '#B3B3B3',
        accent: '#8B5CF6',
        accentSoft: 'rgba(139, 92, 246, 0.08)',
        accentBorder: 'rgba(139, 92, 246, 0.2)',
        accentGlow: 'rgba(139, 92, 246, 0.15)',
        surface: '#0F0F0F',
        deep: '#080808',
      },
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1440px',
      }
    },
  },
  plugins: [],
}
