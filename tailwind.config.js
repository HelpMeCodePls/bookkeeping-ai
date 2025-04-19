/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',               // 手动添加 .dark
  theme: {
    extend: {
      colors: {
        brand : '#2563eb',
        muted : '#64748b',
        bg    : '#f8fafc',
        card  : '#ffffff',
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
