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
      // two React entries: app.html = COMMUNITY HARBOR (/community), admin.html = back office (/backoffice).
      // Every other page is a static file in public/ (map, island sub-maps, topic pages) copied to dist/ as-is.
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
