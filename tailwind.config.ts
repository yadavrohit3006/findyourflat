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
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      boxShadow: {
        'map-card': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'pin': '0 2px 6px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
