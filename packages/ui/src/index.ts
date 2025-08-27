import type { App } from 'vue'
import { YInput } from "./components/index";
import './common/test.css'

// 所有组件列表
const components = [YInput]

// 定义 install 方法，用于整体安装所有组件
const install = (app: App) => {
  components.forEach(component => {
    if (component.install) {
      app.use(component)
    }
  })
}

// 支持按需引入
export { YInput }

// 支持完整引入
export default {
  install,
  YInput
}


