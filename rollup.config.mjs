import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/background.js', 
  output: {
    dir: 'dist', 
    format: 'esm', 
  },
  plugins: [
    nodeResolve({
      browser: true, 
      resolveOnly: ['puppeteer-core'], 
    }),
  ],
};
