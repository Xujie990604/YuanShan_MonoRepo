import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  external: [
    // 将依赖标记为 external，不打包进 bundle
    // 这样使用者需要自己安装这些依赖，避免重复打包
    'lexorank',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      // 不输出 JS 文件，只生成类型声明（rollup 会处理 JS）
      emitDeclarationOnly: false,
      // 保留源代码结构，便于调试
      rootDir: './src',
    }),
  ],
};
