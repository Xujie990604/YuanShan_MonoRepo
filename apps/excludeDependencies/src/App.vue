<script setup lang="ts">
import dayjs from 'dayjs'
console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'))

// 使用全局变量
import axios from 'axios'
axios.get('http://jsonplaceholder.typicode.com/posts').then((res: any) => {
  console.log(res)
})
</script>

<template>
<div class="a">
  使用 external 排除依赖
</div>
</template>

<style scoped>

</style>
