<script setup>
// TODO: npm 包的访问机制是什么样子的？我不想要这样复杂的路径进行引入，是否有配置项可以默认访问这个路径
import {add} from '@yuan-shan/tools/dist/bundle.esm';
console.log(add(1, 5));
import yInput from '@yuan-shan/ui/dist/lib/yuanshan-ui';
console.log(yInput);
</script>

<template>
<yInput></yInput>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
