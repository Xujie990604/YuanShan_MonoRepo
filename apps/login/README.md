# Vue 3 + Vite

## 引入子包

* 这种是直接使用软链接的形式，这种形式的好处就是所有的子包使用的都是同一个版本，且是最新的版本

TODO：在一定程度上我需要版本控制的概念，我并不想工具函数、cli、组件库。工具代码更新之后，在子包中立刻生效

```json
  "@yuan-shan/ui": "workspace:*",
  "@yuan-shan/tools": "workspace:*",
```
