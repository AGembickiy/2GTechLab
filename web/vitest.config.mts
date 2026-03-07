import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@store": path.resolve(__dirname, "src/store"),
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
});

