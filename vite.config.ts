import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // two entries: app.html = new-island pages (original page CSS only), admin.html = back office.
      // The original site (index.html map + every original page) is copied in unchanged by scripts/copy-original-site.mjs.
      input: { app: path.resolve(__dirname, 'app.html'), admin: path.resolve(__dirname, 'admin.html') },
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs", "@radix-ui/react-toast"],
          "vendor-supabase": ["@supabase/supabase-js"],

        },
      },
    },
  },
}));
