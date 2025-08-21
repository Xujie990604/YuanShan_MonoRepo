<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'))

// 使用全局变量
import axios from 'axios'
const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
let currentPage = 1
const pageSize = 10

// 加载数据的方法
const onLoad = async () => {
  try {
    loading.value = true
    const res = await axios.get(`https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=${pageSize}`)
    
    if (res.data.length > 0) {
      list.value.push(...res.data)
      currentPage++
      
      // 模拟数据加载完毕（假设总共只有 100 条数据）
      if (list.value.length >= 100) {
        finished.value = true
      }
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化加载数据
onLoad()
</script>

<template>
  <van-button type="primary">{{ currentTime }}</van-button>
  
  <van-list
  v-model:loading="loading"
  :finished="finished"
  finished-text="没有更多了"
  @load="onLoad"
>
    <van-cell 
      v-for="item in list" 
      :key="item.id" 
      :title="item.title" 
      :label="`ID: ${item.id}`"
    />
</van-list>
</template>

<style scoped>

</style>
