import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
   optimizeDeps: {
    include: ["react-window"],
  },
  server: {
    port: 4000,
    proxy: {
  "/api": {
    target: "http://localhost:8000",
    changeOrigin: true,
    secure: false,
  },
    },
  },
});