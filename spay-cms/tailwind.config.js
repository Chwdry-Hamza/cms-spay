/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Spay mint/teal (primary accent ramp)
        cyan: {
          50: '#E9FEF8',
          100: '#C8FCEC',
          200: '#92F7D9',
          300: '#46F1C5',
          400: '#2EE8A0',
          500: '#04BABF',
          600: '#0B8E84',
          700: '#076058',
        },
        // Spay dark navy/teal (background surfaces)
        navy: {
          500: '#173A44',
          600: '#123039',
          700: '#0F2630',
          800: '#0C1C2A',
          850: '#0A1624',
          900: '#0B1320',
          950: '#090E1C',
        },
        fg: {
          1: '#EDEDED',
          2: '#A6AABE',
          3: '#7A8194',
          4: '#4E5566',
        },
        info: '#04BABF',
        success: '#5BE3A1',
        warning: '#E89B40',
        danger: '#FF7A8A',
        magenta: '#A88AFF',
        // Surfaces (semantic aliases used widely)
        surface: {
          DEFAULT: '#0A1624',
          raised: '#0C1C2A',
          deeper: '#0B1320',
          deepest: '#090E1C',
        },
        line: {
          DEFAULT: 'rgba(70, 241, 197, 0.10)',
          strong: 'rgba(70, 241, 197, 0.22)',
          subtle: 'rgba(70, 241, 197, 0.06)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'spay-xs': '4px',
        'spay-sm': '6px',
        'spay-md': '10px',
        'spay-lg': '16px',
        'spay-xl': '24px',
        'spay-pill': '999px',
      },
      boxShadow: {
        'spay-1': '0 1px 2px rgba(0,0,0,0.5), 0 0 0 1px rgba(70,241,197,0.14)',
        'spay-2': '0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(70,241,197,0.14)',
        'spay-3': '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(70,241,197,0.28)',
        'glow-sm': '0 0 8px rgba(70,241,197,0.35)',
        'glow-md': '0 0 16px rgba(70,241,197,0.45), 0 0 2px rgba(70,241,197,0.6)',
        'glow-lg': '0 0 32px rgba(70,241,197,0.55), 0 0 4px rgba(70,241,197,0.8)',
      },
      transitionTimingFunction: {
        'spay-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'spay-hero-glow': {
          '0%': { opacity: '0.85', transform: 'scale(1)' },
          '100%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'spay-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spay-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'spay-hero-glow': 'spay-hero-glow 6s ease-in-out infinite alternate',
        'spay-fade-in': 'spay-fade-in 180ms cubic-bezier(0.22,1,0.36,1)',
        'spay-scale-in': 'spay-scale-in 160ms cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
