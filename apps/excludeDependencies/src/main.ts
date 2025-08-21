import { createApp } from 'vue'
import App from './App.vue'

// 1. 导入 Vant 组件库和样式
import Vant from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.use(Vant)
app.mount('#app')
