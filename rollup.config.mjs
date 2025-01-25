import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/background.js', // Entry point
  output: {
    dir: 'dist', // Output directory for multiple chunks
    format: 'esm', // ES module format
  },
  plugins: [
    nodeResolve({
      browser: true, // Ensure compatibility with the browser environment
      resolveOnly: ['puppeteer-core'], // Only bundle Puppeteer Core
    }),
  ],
};


//npm run build