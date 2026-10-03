/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        peacock: {
          50: '#EAF9F6',
          100: '#DDF5EF',
          200: '#B8E6DC',
          300: '#8AD3C4',
          400: '#4FBFA8',
          500: '#0B8F78',
          600: '#007F73',
          700: '#005F56',
          800: '#004940',
          900: '#00332D',
        },
        ink: {
          50: '#F6FAF9',
          100: '#E8EFED',
          200: '#C5D2CF',
          300: '#9DAEAB',
          400: '#6B7E7B',
          500: '#4A5C59',
          600: '#1F2D2D',
          700: '#162624',
          800: '#102A2A',
          900: '#0A1C1C',
        },
        success: {
          50: '#E8F8F0',
          100: '#C5EDD9',
          400: '#34A86B',
          500: '#1E8E54',
          600: '#167041',
        },
        warning: {
          50: '#FFF8EB',
          100: '#FFE9C2',
          400: '#E0A32E',
          500: '#C9891A',
          600: '#A66E10',
        },
        danger: {
          50: '#FDECEC',
          100: '#FAD3D3',
          400: '#DC5454',
          500: '#C63838',
          600: '#9E2828',
        },
        info: {
          50: '#EBF2FB',
          100: '#C5DAF5',
          400: '#3B82C4',
          500: '#2563A8',
        },
        research: {
          50: '#F1ECFB',
          100: '#DDCEF4',
          400: '#7C5BB0',
          500: '#63429A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16, 42, 42, 0.06), 0 1px 2px 0 rgba(16, 42, 42, 0.04)',
        'card-hover': '0 8px 24px -6px rgba(16, 42, 42, 0.12), 0 2px 6px -2px rgba(16, 42, 42, 0.06)',
        glow: '0 0 0 3px rgba(11, 143, 120, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'flow-line': 'flowLine 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'progress': 'progress 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        flowLine: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};
