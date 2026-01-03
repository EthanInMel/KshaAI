const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        join(__dirname, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
        join(__dirname, 'components/**/*.{js,ts,jsx,tsx,mdx}'),
    ],
    theme: {
        extend: {
            colors: {
                background: '#030712',
                surface: '#0f172a',
                primary: '#6366f1',
                secondary: '#a855f7',
                accent: '#06b6d4',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                'glass-hover': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(99, 102, 241, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
};
