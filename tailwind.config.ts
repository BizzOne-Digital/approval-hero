import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#04152D',
        'deep-navy': '#072448',
        electric: '#0866FF',
        'bright-blue': '#21A3FF',
        'ice-blue': '#DCEEFF',
        soft: '#F4F8FC',
        graphite: '#0B1423',
        success: '#31D6A1',
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'Oswald', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #04152D 0%, #072448 50%, #04152D 100%)',
        'blue-glow': 'radial-gradient(ellipse at center, rgba(8,102,255,0.3) 0%, transparent 70%)',
      },
      animation: {
        'beam-sweep': 'beamSweep 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        beamSweep: {
          '0%, 100%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { transform: 'translateX(100%)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(8,102,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(8,102,255,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
