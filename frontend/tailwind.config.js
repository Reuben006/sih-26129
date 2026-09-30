/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govblue: {
          50: '#f0f5fa',
          100: '#e1ecf6',
          200: '#c3d9ed',
          500: '#1b5aa6',
          700: '#103d75',
          800: '#0c2d57',
          900: '#081d39',
        },
        govsaffron: {
          500: '#ff9933',
          600: '#e67e22',
        },
        govgreen: {
          600: '#138808',
          700: '#0e6906',
        }
      }
    },
  },
  plugins: [],
}
