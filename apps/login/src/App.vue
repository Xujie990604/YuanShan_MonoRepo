<script setup>
// NOTE：一个项目的默认导出文件可以通过 package.json 中的main(commonjs规范)、module(ESM规范) 字段进行指定，
import { add } from '@yuan-shan/tools';
console.log(add(1, 9));
import yInput from '@yuan-shan/ui/dist/yuanshan-ui';
// TODO： yInput   Vue.component 进行注册？之后才能用
console.log(yInput);
</script>

<template>
<yInput></yInput>
</template>

<style scoped>
</style>
