/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [ // Needed for displaying AI summary colours correctly
    {
      pattern: /(from|to)-(blue|green|orange|purple)-(50|100)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3AB0FF',
        'primary-dark': '#2A8FCC',
        'background-dark': '#0E1A2B',
        'text-light': '#3AB0FF',
      },
    },
  },
  plugins: [],
} 