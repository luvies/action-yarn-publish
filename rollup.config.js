import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/main.ts',
  output: {
    file: 'build/action.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [typescript(), resolve(), commonjs(), terser()],
};
