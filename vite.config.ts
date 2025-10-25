import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['primereact', 'primeicons', 'primeflex'],
          charts: ['apexcharts', 'react-apexcharts'],
          utils: ['clsx', 'tailwind-merge', 'framer-motion']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://3.106.241.43:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/auth': {
        target: 'http://3.106.241.43:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});
