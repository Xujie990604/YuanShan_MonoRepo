<script setup lang="ts">
// 导入子包的工具函数
import { add } from '@yuan-shan/tools';
console.log(add(1, 9));

// 按需导入组件
import { YInput } from '@yuan-shan/ui';
</script>

<template>
  <div>
    <h1 class="test-h1">测试组件库</h1>
    <YInput />
  </div>
</template>

<style scoped>
</style>
