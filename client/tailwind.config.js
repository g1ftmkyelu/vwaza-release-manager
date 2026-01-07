/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-primary': '#18181b',    // zinc-900
        'dark-bg-secondary': '#27272a',  // zinc-800
        'dark-bg-tertiary': '#3f3f46',   // zinc-700
        'lime-accent': '#3b82f6',        // blue-500
        'lime-light': '#60a5fa',         // blue-400
        'status-draft': '#6b7280',       // gray-500
        'status-processing': '#fbbf24',  // amber-400
        'status-pending': '#3b82f6',     // blue-500
        'status-published': '#3b82f6',   // blue-500 (changed from green)
        'status-rejected': '#ef4444',    // red-500
      },
      boxShadow: {
        'lime-glow': '0 0 20px rgba(59, 130, 246, 0.3)',      // blue glow
        'lime-glow-md': '0 0 15px rgba(59, 130, 246, 0.2)',   // blue glow
        'lime-glow-sm': '0 0 10px rgba(59, 130, 246, 0.15)',  // blue glow
      },
      backdropBlur: {
        'xl': '20px',
      },
    },
  },
  plugins: [],
}
