import type { App } from 'vue'
import YInput from './input.vue'

// 为单个组件添加 install 方法
YInput.install = (app: App) => {
  app.component('YInput', YInput)
}

export default YInput
