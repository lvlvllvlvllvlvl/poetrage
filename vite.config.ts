import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      overlay: { initialIsOpen: false },
      typescript: true,
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules") && id.endsWith(".js")) {
            // For identifying large dependencies
            // const segments = id.split("/");
            // const debug = segments[segments.indexOf("node_modules") + 1];
            // return debug || "vendor";
            return (
              ["axios", "lodash", "mui", "reactflow"].find((dep) =>
                id.includes(dep),
              ) || "vendor"
            );
          } else if (id.includes("data")) {
            return id.substring(id.lastIndexOf("/") + 1, id.indexOf("."));
          }
        },
      },
    },
  },
  worker: {
    plugins: [tsconfigPaths()],
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
