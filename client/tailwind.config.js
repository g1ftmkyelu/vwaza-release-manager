/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
'dark-bg-primary': '#0f172a',    // slate-900
        'dark-bg-secondary': '#1e293b',  // slate-800
        'dark-bg-tertiary': '#334155',   // slate-700
        'lime-accent': '#84cc16',
        'lime-light': '#a3e635',
        'status-draft': '#6b7280', // gray-500
        'status-processing': '#fbbf24', // amber-400
        'status-pending': '#3b82f6', // blue-500
        'status-published': '#22c55e', // green-500
        'status-rejected': '#ef4444', // red-500
      },
      boxShadow: {
        'lime-glow': '0 0 20px rgba(132, 204, 22, 0.3)',
        'lime-glow-md': '0 0 15px rgba(132, 204, 22, 0.2)',
        'lime-glow-sm': '0 0 10px rgba(132, 204, 22, 0.15)',
      },
      backdropBlur: {
        'xl': '20px',
      },
    },
  },
  plugins: [],
}