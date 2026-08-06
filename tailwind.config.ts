import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color System — StepUp brand
        primary: '#00288e',
        'primary-container': '#1e40af',
        'on-primary': '#ffffff',
        'on-primary-container': '#a8b8ff',
        'primary-fixed': '#dde1ff',
        'primary-fixed-dim': '#b8c4ff',
        'on-primary-fixed': '#001453',
        'on-primary-fixed-variant': '#173bab',

        secondary: '#565e74',
        'secondary-container': '#dae2fd',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#5c647a',
        'secondary-fixed': '#dae2fd',
        'secondary-fixed-dim': '#bec6e0',
        'on-secondary-fixed': '#131b2e',
        'on-secondary-fixed-variant': '#3f465c',

        tertiary: '#323537',
        'tertiary-container': '#484c4e',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#b9bcbe',
        'tertiary-fixed': '#e0e3e5',
        'tertiary-fixed-dim': '#c4c7c9',
        'on-tertiary-fixed': '#191c1e',
        'on-tertiary-fixed-variant': '#444749',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        background: '#fbf8ff',
        'on-background': '#1a1b22',

        surface: '#fbf8ff',
        'surface-dim': '#dad9e3',
        'surface-bright': '#fbf8ff',
        'surface-tint': '#3755c3',
        'surface-variant': '#e3e1eb',
        'inverse-surface': '#2f3037',
        'inverse-on-surface': '#f1f0fa',
        'inverse-primary': '#b8c4ff',
        'on-surface': '#1a1b22',
        'on-surface-variant': '#444653',

        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f2fc',
        'surface-container': '#eeedf7',
        'surface-container-high': '#e8e7f1',
        'surface-container-highest': '#e3e1eb',

        outline: '#757684',
        'outline-variant': '#c4c5d5',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        'body-md': ['Be Vietnam Pro', 'sans-serif'],
        'headline-md': ['Be Vietnam Pro', 'sans-serif'],
        'label-sm': ['Be Vietnam Pro', 'sans-serif'],
        'display-lg': ['Be Vietnam Pro', 'sans-serif'],
        'headline-lg': ['Be Vietnam Pro', 'sans-serif'],
        'body-lg': ['Be Vietnam Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.04em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.03em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title-lg': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '48px',
        gutter: '24px',
        'container-margin': '32px',
        sidebar: '280px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 16px rgba(0,40,142,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        'sidebar': '1px 0 8px rgba(0,0,0,0.04)',
        'header': '0 1px 0 rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
