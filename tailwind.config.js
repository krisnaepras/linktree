/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)"
            },
            fontFamily: {
                sans: [
                    "var(--font-poppins)",
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "'Segoe UI'",
                    "Roboto",
                    "'Helvetica Neue'",
                    "Arial",
                    "sans-serif"
                ],
                poppins: ["var(--font-poppins)", "sans-serif"],
                mono: [
                    "'SFMono-Regular'",
                    "Menlo",
                    "Monaco",
                    "Consolas",
                    "'Liberation Mono'",
                    "'Courier New'",
                    "monospace"
                ]
            }
        }
    },
    plugins: []
    // Force Vercel rebuild
};
