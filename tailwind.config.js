/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#ffffff',
        'accent-muted': '#a0a0a0',
        'bg-primary': '#0a0a0a',
        'glass-bg': 'rgba(20, 20, 20, 0.8)',
      },
      fontFamily: {
        'clash': ['Clash Display', 'sans-serif'],
        'satoshi': ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s infinite',
        'flicker': 'flicker 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
}

