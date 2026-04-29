/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unimed: {
          verde: '#00995d',
          escuro: '#004e4c',
          citrico: '#b1d34b',
          laranja: '#f47920',
        },
        apoio: {
          'rosa-terra': '#d2a494',
          'rosa-claro': '#f1cdcd',
          bege: '#ece3d9',
          'amarelo-suave': '#ffe596',
          'verde-menta': '#cde3bb',
          'azul-ceu': '#a4d8de',
        },
        base: {
          cream: '#F2EBE0',
          accent: '#A06820',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'], 
        display: ['"Playfair Display"', 'serif'], 
        mono: ['"DM Mono"', 'monospace'], 
      }
    },
  },
  plugins: [],
}