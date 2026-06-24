import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'


export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    cors: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});