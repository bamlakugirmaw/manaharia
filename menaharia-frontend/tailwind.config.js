/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0096C7',   // "Menaharia" Branding Blue
                secondary: '#F72585', // Action Pink/Red
                accent: '#FFB703',    // Highlights/Stars
                success: '#10B981',   // Green
                warning: '#F59E0B',   // Orange
                danger: '#EF4444',    // Red
                dark: '#1D3557',      // Navy headers
                light: '#F8F9FA',     // Backgrounds
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
