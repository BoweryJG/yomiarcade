import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        enhanced: resolve(__dirname, 'index-enhanced.html'),
        simpleWorking: resolve(__dirname, 'simple-working.html'),
        workingDemo: resolve(__dirname, 'working-demo.html'),
        yomiChallenge: resolve(__dirname, 'yomi-precision-challenge.html'),
        enhancedDemo: resolve(__dirname, 'enhanced-demo.html'),
        indexOriginal: resolve(__dirname, 'index-original.html'),
        authSupabase: resolve(__dirname, 'auth-supabase.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});