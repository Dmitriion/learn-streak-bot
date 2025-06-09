
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Правильно передаем environment variables для Vite
    __APP_ENV__: JSON.stringify(mode),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    // Оптимизация для Telegram Mini App
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          telegram: ['@twa-dev/sdk'],
          charts: ['recharts']
        }
      }
    },
    // Оптимизация размера bundle
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['@twa-dev/sdk', 'recharts']
  },
  // Добавляем поддержку SPA роутинга
  preview: {
    host: true,
    port: 4173,
  }
}));
