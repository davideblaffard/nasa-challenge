export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        void:    '#050508',
        cosmos:  '#0d0d1a',
        nebula:  '#12121e',
        pulse:   '#00ff41',
        hazard:  '#ff2a6d',
        cyan:    '#05d9e8',
        amber:   '#ffd700',
        purple:  '#b14cf8',
        orange:  '#ff6b35',
        dim:     '#666688',
        silver:  '#c0c0d0',
      },
      animation: {
        'pixel-blink': 'pixel-blink 1s steps(1) infinite',
        'pixel-pulse': 'pixel-pulse 0.5s steps(1) infinite',
      },
      keyframes: {
        'pixel-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
        'pixel-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
