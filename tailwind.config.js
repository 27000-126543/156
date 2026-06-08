/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ocean: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc9fb",
          400: "#37aaf6",
          500: "#3E92CC",
          600: "#0d74d6",
          700: "#0c5cb0",
          800: "#0A2463",
          900: "#071a4a",
          950: "#050f2f",
        },
        coral: {
          50: "#fef3f0",
          100: "#ffe4dc",
          200: "#ffcdbe",
          300: "#ffaa93",
          400: "#f46036",
          500: "#e94a1f",
          600: "#ca3514",
          700: "#a82814",
          800: "#8a2317",
          900: "#722218",
        },
        seaweed: {
          50: "#f0fdf7",
          100: "#ccfbe6",
          200: "#9af5cf",
          300: "#5ae6b3",
          400: "#1B998B",
          500: "#06a37b",
          600: "#028566",
          700: "#036a54",
          800: "#075344",
          900: "#08453a",
        },
        sand: {
          50: "#fdfcf8",
          100: "#faf7ed",
          200: "#f4ecd6",
          300: "#ebdbb6",
          400: "#e0c58e",
          500: "#d4ae6a",
          600: "#c89452",
          700: "#a87743",
          800: "#875f3b",
          900: "#6e4e34",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(62, 146, 204, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(62, 146, 204, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
