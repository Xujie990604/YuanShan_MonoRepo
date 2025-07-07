<script setup lang="ts">
import dayjs from 'dayjs'
console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'))


import axios from 'axios'
axios.get('http://jsonplaceholder.typicode.com/posts').then(res => {
  console.log(res)
})
</script>

<template>
  <div>
    <h1>car</h1>
  </div>
</template>

<style scoped>

</style>
