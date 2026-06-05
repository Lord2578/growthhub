import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px hsl(var(--primary) / 0.35)' },
          '50%':       { boxShadow: '0 0 22px hsl(var(--primary) / 0.65), 0 0 44px hsl(var(--primary) / 0.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          from: { transform: 'translateX(-200%)' },
          to:   { transform: 'translateX(200%)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.9)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in-up':   'fade-in-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':      'fade-in 0.35s ease both',
        'scale-in':     'scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-right':  'slide-right 0.3s ease both',
        'glow-pulse':   'glow-pulse 2.2s ease-in-out infinite',
        'float':        'float 3.5s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'count-up':     'count-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
      boxShadow: {
        'glow-primary': '0 0 20px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.1)',
        'glow-sm': '0 0 12px hsl(var(--primary) / 0.35)',
        'card': '0 4px 24px hsl(0 0% 0% / 0.3), 0 1px 4px hsl(0 0% 0% / 0.2)',
        'card-hover': '0 16px 48px hsl(0 0% 0% / 0.5), 0 4px 16px hsl(0 0% 0% / 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
