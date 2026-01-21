/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['STIX Two Text', 'serif'],
      },
      colors: {
        background: '#f0ece6',
        primary: '#8B6F47',
        'primary-light': '#A68B65',
        'primary-dark': '#6B5335',
        accent: '#C9A86A',
        'accent-light': '#E5C896',
      },
    },
  },
  plugins: [],
}