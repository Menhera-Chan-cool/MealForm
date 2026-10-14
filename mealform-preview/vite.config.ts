import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { watch: { ignored: ['**/storybook-static/**', '**/dist/**', '**/review/**', '**/test-results/**'] } },
  resolve: { dedupe: ['react', 'react-dom'], alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
});
