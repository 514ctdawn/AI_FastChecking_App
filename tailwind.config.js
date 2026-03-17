/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'ds-sm': '8px',
        'ds-md': '12px',
        'ds-lg': '16px',
      },
      colors: {
        navy: {
          DEFAULT: '#0F172A',
          '900': '#0F172A',
          '800': '#1E293B',
        },
        surface: '#F8FAFC',
        muted: '#64748B',
        // Muted alerts (formal - accent bars)
        sage: '#4A7C59',
        brick: '#9B3B3B',
        ochre: '#B8860B',
        // CTA: International Klein Blue
        klein: '#002FA7',
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      boxShadow: {
        'ds-card': '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06)',
        'ds-card-hover': '0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.08)',
        'ds-card-focus-sage': '0 4px 16px rgba(74, 124, 89, 0.12)',
        'ds-card-focus-brick': '0 4px 16px rgba(155, 59, 59, 0.12)',
        'ds-card-focus-ochre': '0 4px 16px rgba(184, 134, 11, 0.12)',
      },
      fontSize: {
        'body': ['1.125rem', { lineHeight: '1.75' }],  // 18px min for body
        'large': ['1.25rem', { lineHeight: '1.6' }],
        'xl': ['1.5rem', { lineHeight: '1.5' }],
        '2xl': ['2rem', { lineHeight: '1.3' }],
        '3xl': ['2.5rem', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
}
