import { createApp } from 'vue'
import App from './App.vue'
// 引入组件库样式
import '@yuan-shan/ui/style'

// 方式一：完整引入 UI 组件库（全局注册所有组件）
// import YuanShanUI from '@yuan-shan/ui'
// const app = createApp(App)
// app.use(YuanShanUI)
// app.mount('#app')

// 方式二：按需全局注册单个组件
// import { YInput } from '@yuan-shan/ui'
// const app = createApp(App)
// app.use(YInput)  // 调用组件的 install 方法
// app.mount('#app')

// 方式三：局部导入（当前使用的方式，无需 install）
const app = createApp(App)
app.mount('#app')
