import { defineConfig } from "tsup"

export const baseOptions = () => ({
  entryPoints: {
    index: 'src/index.ts',
    worker: 'src/worker/server.js',
  },
	splitting: true,
	clean: true,
	bundle: true,
	minify: true,
  noExternal: [/.*/],
  sourcemap: true,
});

export default defineConfig(baseOptions)
