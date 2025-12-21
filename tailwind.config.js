/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,css}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fff4f1',
        solid: '#ff0033',
        solidOne: 'bisque',
        solidTwo: '#fff4f2',
        tertiary: '#ffdaad',
        textColor: '#ffc885',
        'gray-50': '#404040',
        solidThree:"#0099a8",
        solidFour:"#1e3a8a",
        solidFive:"#6bbf59",
        action:"#ff6f61",
        tinhte:"#ffb6a6",
        xinxo: "#ffcc00",
      },
      fontFamily: {
        outfit: ["'Outfit'", 'sans-serif'],
      },
    },
  },
  plugins: [],
}

