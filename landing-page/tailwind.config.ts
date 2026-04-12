import type { Config } from "tailwindcss"

// Tailwind v4 utilise principalement CSS pour la configuration
// Ce fichier reste pour la compatibilité avec les plugins et certaines configurations
const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
} satisfies Config

export default config