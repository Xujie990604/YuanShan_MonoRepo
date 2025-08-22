import { createApp } from 'vue'
import App from './App.vue'
import Vant from 'vant'

const app = createApp(App)
app.use(Vant)

// 开发环境按需加载 Vant 样式；生产环境用 CDN 注入
if (import.meta.env.DEV) {
  void import('vant/lib/index.css')
}

app.mount('#app')
