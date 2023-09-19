import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

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
    worker: {
        plugins: [tsconfigPaths()]
    },
    test: {
        globals: true,
        environment: 'jsdom',
    }
});
