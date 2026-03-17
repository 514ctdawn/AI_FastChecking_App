// tailwind.config.js - for NativeWind (when configured)
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'veri-navy': '#1E293B',
        'veri-slate': '#64748B',
        'veri-bg': '#F8FAFC',
        'veri-blue': '#2563EB',
        'veri-true-bg': '#D1FAE5',
        'veri-true-text': '#065F46',
        'veri-false-bg': '#FFE4E6',
        'veri-false-text': '#9F1239',
        'veri-caution-bg': '#FFEDD5',
        'veri-caution-text': '#9A3412',
      },
      borderRadius: {
        veri: 24,
      },
      boxShadow: {
        soft: '0 10px 30px rgba(100, 116, 139, 0.05)',
        'glow-blue': '0 4px 15px rgba(37, 99, 235, 0.4)',
      },
    },
  },
  plugins: [],
};
