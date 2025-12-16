import { defineConfig } from 'vite';
import reactSWC from '@vitejs/plugin-react-swc';

export default defineConfig({
  define: {
    global: 'window'
  },
  plugins: [reactSWC()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'build'
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls']
      }
    }
  },
  assetsInclude: ['**/*.xlsx']
});
