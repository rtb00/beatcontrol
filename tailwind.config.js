/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy "Hochzeits-Elegance" palette — kept until every page has migrated,
        // then removed (see migration plan, Phase 3 cleanup).
        cream: '#faf6f0',
        ivory: '#f4ede0',
        champagne: '#e8d9b8',
        gold: '#c9a961',
        ink: '#2a2520',
        muted: '#8a7a6e',

        // "Confetti Rave" design system (Version 3). Named `neon-gold` (not `gold`)
        // to avoid colliding with the legacy champagne-gold above during migration.
        base: { DEFAULT: 'var(--bg-base)', alt: 'var(--bg-base-alt)' },
        panel: { DEFAULT: 'var(--bg-panel)', elevated: 'var(--bg-panel-elevated)' },
        magenta: { DEFAULT: 'var(--accent-magenta)', soft: 'var(--accent-magenta-soft)' },
        'neon-gold': { DEFAULT: 'var(--accent-gold)', soft: 'var(--accent-gold-soft)' },
        fg: { DEFAULT: 'var(--text-primary)', muted: 'var(--text-muted)' },
        line: 'var(--line)',
        success: { DEFAULT: 'var(--color-success)', bg: 'var(--color-success-bg)' },
        danger: { DEFAULT: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-rounded', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        pop: 'pop 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
