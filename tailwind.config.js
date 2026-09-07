/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'editorial': ['Instrument Serif', 'serif'],
        'grotesk': ['Clash Display', 'sans-serif'],
        'accent': ['Space Mono', 'monospace'],
        'sf': ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
      },
      boxShadow: {
        'tile': '0 4px 24px rgba(0,0,0,0.06)',
        'tile-dark': '0 4px 24px rgba(0,0,0,0.5)',
      },
      transitionTimingFunction: {
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      colors: {
        'apple': {
          'bg': '#fbfbfd',
          'surface': '#f5f5f7',
          'text': '#1d1d1f',
          'muted': '#6e6e73',
          'blue': '#0071e3',
          'blueHover': '#0077ed',
          'blueDark': '#2997ff',
          'dark': '#000000',
          'darkSurface': '#1d1d1f',
          'darkText': '#f5f5f7',
          'darkMuted': '#a1a1a6',
        },
        'cyber': {
          'neon': '#00ff88',
          'pink': '#ff0080',
          'blue': '#00d4ff',
          'purple': '#8b5cf6',
          'dark': '#0a0a0f',
        },
        'luxury': {
          'gold': '#c9a962',
          'champagne': '#f7e7ce',
          'black': '#1a1a1a',
          'cream': '#faf8f5',
        },
        'organic': {
          'mint': '#98e4c9',
          'peach': '#ffcdb2',
          'lavender': '#e0c3fc',
          'sky': '#a2d2ff',
        },
        'deco': {
          'gold': '#d4af37',
          'navy': '#1a1f3c',
          'cream': '#f5f0e1',
          'copper': '#b87333',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s step-end infinite',
        'glitch': 'glitch 1s linear infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' },
          'to': { boxShadow: '0 0 30px #00d4ff, 0 0 60px #00d4ff' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(-30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        typewriter: {
          'to': { left: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        'grid-pattern': 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
