
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
    // Безопасно передаем environment variables
    __TELEGRAM_BOT_TOKEN__: JSON.stringify(process.env.VITE_TELEGRAM_BOT_TOKEN || 'development_token'),
    __N8N_WEBHOOK_URL__: JSON.stringify(process.env.VITE_N8N_WEBHOOK_URL || ''),
    __APP_ENV__: JSON.stringify(mode),
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
  }
}));
