import { readFileSync } from 'node:fs'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const libraryName = 'zxy-axios'
const umdName = libraryName.replace(/-(\w)/g, (_, char) => char.toUpperCase())

export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.main, name: umdName, format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    // rollup 4 的 node-resolve 默认不认识 .ts，需要显式声明扩展名，
    // 否则 './axios' 这类无扩展名的 TS 相对导入会解析失败
    resolve({ extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] }),
    commonjs(),
    // 类型声明由 build 脚本里的 tsc 负责，这里只做打包
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        // 声明文件由 build 脚本里的 tsc 负责，打包阶段只想拿到 JS
        outDir: 'dist',
        declaration: false,
        declarationMap: false,
      },
      sourceMap: true,
    }),
  ],
}
