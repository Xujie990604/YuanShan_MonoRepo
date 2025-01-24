import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts', // 入口文件
    output: [
        {
            file: 'dist/bundle.esm.js',
            format: 'esm' // ES 模块格式
        }
    ],
    plugins: [
        typescript() // 使用 TypeScript 插件处理 TS 文件
    ]
};