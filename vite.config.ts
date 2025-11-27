import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const port = Number(process.env.PORT) || 4444;
const host = process.env.HOST || "localhost";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [react(), tailwindcss()],
  server: {
    port,
    host,
  },
});
