import { defineConfig } from 'vite';

// Su GitHub Pages il sito vive nella sottocartella /Montevecchia/, in locale sulla root.
const base = process.env.GITHUB_ACTIONS ? '/Montevecchia/' : '/';

export default defineConfig({
  base,
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
    reportCompressedSize: false
  },
  server: {
    port: 3000,
    open: true
  }
});
