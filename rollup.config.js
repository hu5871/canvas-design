import ts from 'rollup-plugin-typescript2'
import path,{ dirname } from 'path'
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './lib/index.ts',
  output: {
      file: path.resolve(__dirname, './dist/index.js'),
      format: 'es',
      globals:"Design",//全局变量名字
      sourcemap: true
  },
  plugins:[
    resolve(),    // 解析 node_modules 中的依赖
    commonjs(),   // 将 CommonJS 模块转换为 ES6
    ts(),
    serve({
      open:false,//是否自动打开浏览器
      port:3000,
      contentBase:'',
      openPage:"/index.html"
    }),
    livereload()
  ]
};