import * as path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:3001';
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/auth': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/api/users': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/api/support': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/api/settings': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/api/uploads': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        }
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', 'lucide-react'],
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'vendor-pdf': ['jspdf'],
            'vendor-state': ['zustand'],
          }
        }
      },
      chunkSizeWarningLimit: 800,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
