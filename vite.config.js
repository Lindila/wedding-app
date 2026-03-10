import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Si tu déploies sur GitHub Pages, décommente et remplace :
  // base: "/wedding-protocole/",
});
