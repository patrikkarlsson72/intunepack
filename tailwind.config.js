/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'create-package': 'var(--create-package)',
        'create-package-foreground': 'var(--create-package-foreground)',
        'extract-package': 'var(--extract-package)',
        'extract-package-foreground': 'var(--extract-package-foreground)',
      },
    },
  },
  plugins: [],
}

