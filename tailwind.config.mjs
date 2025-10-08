// tailwind.config.mjs
import { heroui } from '@heroui/theme';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/components/(badge|button|card|image|input|listbox|modal|skeleton|spacer|spinner|table|tabs|toast|popover|ripple|form|divider|checkbox).js',
    ],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [
        heroui(),
        typography,
        function ({addUtilities}) {
            addUtilities({
                '.scrollbar-hide': {
                    /* IE and Edge */
                    '-ms-overflow-style': 'none',
                    /* Firefox */
                    'scrollbar-width': 'none',
                    /* Safari and Chrome */
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                },
            });
        },
    ],
};

export default config;
