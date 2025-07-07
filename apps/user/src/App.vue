<script setup lang="ts">
import { add } from '@yuan-shan/tools'

console.log(add(1, 2))

import dayjs from 'dayjs'
console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'))

import axios from 'axios'
axios.get('http://jsonplaceholder.typicode.com/posts').then(res => {
  console.log(res)
})
</script>

<template>
<div class="user">
  <h1>user</h1>
</div>
</template>

<style scoped>

</style>
