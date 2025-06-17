/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'n400': '400px',
      'n480': '480px',
      'n510': '510px',
      'sm': '640px',
      'md': '768px',
      'n950': '950px',
      'lg': '1024px',
      'n1200': '1200px',
      'xl': '1280px',
      'n1440': '1440px',
    },
    extend: {},
  },
}
