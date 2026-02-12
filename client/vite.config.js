import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178, 
    // Fix frontend port so it doesn’t change
  },
});
