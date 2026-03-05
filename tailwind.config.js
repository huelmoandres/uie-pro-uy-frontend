/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // Premium Pro Palette
                primary: {
                    DEFAULT: '#0B1120', // Deep Navy
                    light: '#1E293B',
                    dark: '#020617',
                },
                accent: {
                    DEFAULT: '#B89146', // Refined Metallic Gold
                    light: '#D4B781',
                    dark: '#8C6D2E',
                    muted: 'rgba(184, 145, 70, 0.15)',
                },
                // Backgrounds & Surfaces
                background: {
                    light: '#F8FAFC',
                    dark: '#0B1120',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#1E293B',
                    border: {
                        light: '#E2E8F0',
                        dark: 'rgba(255, 255, 255, 0.05)',
                    }
                },
                // Semantic
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                info: '#3B82F6',

                // Specific Navy Palette
                navy: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0B1120',
                    950: '#020617',
                },
            },
            fontFamily: {
                sans: ['Inter_400Regular', 'System'],
                'sans-semi': ['Inter_600SemiBold', 'System'],
                'sans-bold': ['Inter_700Bold', 'System'],
            },
            boxShadow: {
                'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'premium-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
            }
        },
    },
    darkMode: 'class',
    plugins: [],
};
