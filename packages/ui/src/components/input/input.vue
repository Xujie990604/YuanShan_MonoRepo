<script setup lang="js">
import { ref } from 'vue';


const name = ref('input 组件默认提示文字');
</script>

<template>
  <h1>input组件</h1>
  <input type="text" :placeholder="name" />
</template>

<style scoped>
input {
  background-color: red;
}
</style>