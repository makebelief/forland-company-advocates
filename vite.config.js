import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  build: {
    emptyOutDir: true,
    sourcemap: false,
  },
});
