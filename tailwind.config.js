// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.05)',
        neu:  '8px 8px 16px rgba(0,0,0,0.05), -8px -8px 16px rgba(255,255,255,0.8)',
      },
      colors: {
        // Paleta pastel vibrante - cores suaves e coloridas para melhor legibilidade
        'emerald': '#6EE7B7',            // Verde esmeralda pastel
        'forest': '#10B981',             // Verde floresta médio
        'coral': '#FED7AA',              // Coral pastel
        'sky': '#7DD3FC',                // Azul céu pastel
        'purple': '#C4B5FD',             // Roxo pastel
        'lime': '#BEF264',               // Verde lima pastel
        'pink': '#F9A8D4',               // Rosa pastel
        'amber': '#FDE68A',              // Âmbar pastel
        'cyan': '#67E8F9',               // Ciano pastel
        'indigo': '#A5B4FC',             // Índigo pastel
        'rose': '#FECACA',               // Rosa pastel
        'teal': '#5EEAD4',               // Verde-azulado pastel
        'violet': '#DDD6FE',             // Violeta pastel
        'orange': '#FDBA74',             // Laranja pastel
        'yellow': '#FEF08A',             // Amarelo pastel
        
        // Cores do sistema (paleta pastel com fundo branco)
        'primary-bg': '#FFFFFF',         // Branco puro - fundo principal
        'on-primary': '#1F2937',         // Cinza escuro - texto principal
        'accent': '#6EE7B7',             // Verde esmeralda pastel - destaques
        'highlight': '#10B981',          // Verde floresta - títulos importantes
        
        // Cores adicionais pastéis
        'brand-primary': '#6EE7B7',      // Verde esmeralda pastel
        'brand-secondary': '#7DD3FC',    // Azul céu pastel
        'brand-accent': '#FED7AA',       // Coral pastel
        'brand-purple': '#C4B5FD',       // Roxo pastel
        'brand-lime': '#BEF264',         // Verde lima pastel
        'brand-pink': '#F9A8D4',         // Rosa pastel
        'brand-amber': '#FDE68A',        // Âmbar pastel
        'brand-cyan': '#67E8F9',         // Ciano pastel
        'brand-indigo': '#A5B4FC',       // Índigo pastel
        'brand-rose': '#FECACA',         // Rosa pastel
        'brand-teal': '#5EEAD4',         // Verde-azulado pastel
        'brand-violet': '#DDD6FE',       // Violeta pastel
        'brand-orange': '#FDBA74',       // Laranja pastel
        'brand-yellow': '#FEF08A',       // Amarelo pastel
      },
    },
  },
  plugins: [],
}
