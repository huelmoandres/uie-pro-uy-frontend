/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // Premium Pro Palette — Dark: Warm Charcoal
                primary: {
                    DEFAULT: '#13100D', // Warm Charcoal (replaces Deep Navy)
                    light: '#211C17',   // Warm surface
                    dark: '#0A0806',    // Deepest charcoal
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
                    dark: '#13100D',    // Warm Charcoal
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#211C17',    // Warm surface
                    border: {
                        light: '#E2E8F0',
                        dark: 'rgba(255, 255, 255, 0.06)',
                    }
                },
                // Semantic
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                info: '#3B82F6',

                // Warm Charcoal scale (replaces navy in dark mode)
                navy: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#2C2420',    // Warm dark surface
                    800: '#211C17',    // Warm surface
                    900: '#13100D',    // Warm Charcoal
                    950: '#0A0806',    // Deepest
                },
            },
            fontFamily: {
                sans: ['Inter_400Regular', 'System'],
                'sans-semi': ['Inter_600SemiBold', 'System'],
                'sans-bold': ['Inter_700Bold', 'System'],
            },
            boxShadow: {
                'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'premium-dark': '0 4px 24px -2px rgba(0, 0, 0, 0.5)',
            }
        },
    },
    darkMode: 'class',
    plugins: [],
};
