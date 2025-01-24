import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

export default {
  input: "./src/index.ts",
  output: {
    name: "YuanShan-UI",
    file: "./dist/yuanshan-ui.js",
    format: "es",
  },
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
    typescript(),
    postcss({
      plugins: [autoprefixer(), cssnano()],
      extract: "css/index.css",
    }),
  ],
};