import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "./dist/yuanshan-ui.js",
      format: "es",
      exports: "named"
    }
  ],
  external: ["vue"],
  plugins: [
    resolve(),
    commonjs(),
    vue({
      target: "browser",
      include: "**/*.vue",
      isProduction: true,
      css: false, // 交给 rollup-plugin-postcss 处理
      transformAssetUrls: true,
    }),
    typescript({
      declaration: true,
      declarationDir: "./dist"
    }),
    postcss({
      plugins: [autoprefixer(), cssnano()],
      extract: "css/index.css",
    }),
  ],
};