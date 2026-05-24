import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F2',
        'cream-dark': '#F2EDE3',
        burgundy: {
          DEFAULT: '#8B2E3F',
          dark: '#7A2435',
          light: '#A6495A',
        },
        gold: {
          DEFAULT: '#C9A040',
          dark: '#B8902E',
          light: '#D4B862',
        },
        ink: '#2C1810',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
