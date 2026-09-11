/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{tsx,ts,js,jsx}'],
  theme: {
    extend: {
      fontSize: {
        base: ['13pt', '1.5'], // 13pt base size, line‑height 1.5
        lg: ['14pt', '1.6'],
      },
      colors: {
        primary: '#3B2714',    // dark brown for text
        background: '#FBF5E6', // warm cream
        cream: {
          50:  '#FEFCF6',
          100: '#FBF5E6',
          200: '#F5EBD1',
          300: '#EEDCB5',
        },
        brown: {
          600: '#5C3D1E',
          700: '#4A3118',
          800: '#3B2714',
          900: '#2A1B0D',
        },
      },
    },
  },
  plugins: [],
};
