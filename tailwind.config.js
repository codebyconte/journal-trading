/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Base dark theme (TradingView / Hyperliquid inspired)
        bg: {
          base:     '#0a0b0f',
          surface:  '#111318',
          card:     '#16181f',
          elevated: '#1c1f2a',
          hover:    '#22263a',
        },
        border: {
          DEFAULT: '#2E3444',
          subtle:  '#232836',
          strong:  '#454E62',
        },
        accent: {
          DEFAULT:   '#6366f1',  // indigo primary
          dim:       '#6366f120',
          secondary: '#f59e0b',  // amber
        },
        profit: {
          DEFAULT: '#34D399',
          dim:     '#34D39928',
          muted:   '#22c55e',
        },
        loss: {
          DEFAULT: '#F87171',
          dim:     '#F8717128',
          muted:   '#ef4444',
        },
        neutral: {
          DEFAULT: '#FBBF24',
          dim:     '#FBBF2428',
        },
        text: {
          primary:   '#F8FAFC',
          secondary: '#C4D0E0',
          muted:     '#94A3B8',
          disabled:  '#5A6478',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
        shimmer:          'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
