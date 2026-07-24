import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Serve the repository-level avatar and clip library at /assets/.
  publicDir: "../assets",
  server: {
    port: 5173,
  },
});
