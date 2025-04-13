import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    port: 4444,
  },
});
