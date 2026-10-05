import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          primary: '#714B67',
          dark: '#58364F',
          teal: '#017E84',
          'teal-dark': '#006166',
          amber: '#E59324',
          bg: '#F8F9FA',
          border: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
