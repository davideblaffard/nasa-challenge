export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        display: ['"Bebas Neue"', 'sans-serif'],
      },
      colors: {
        void: '#050508',
        cosmos: '#0a0a12',
        nebula: '#12121e',
        pulse: '#00ff88',
        hazard: '#ff3366',
        dim: '#8888aa',
      },
    },
  },
  plugins: [],
}
