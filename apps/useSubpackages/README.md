# 使用子包内容

## 一、引入子包

* 这种是直接使用软链接的形式，这种形式的好处就是所有的子包使用的都是同一个版本，且是最新的版本

### 版本控制

TODO：在一定程度上我需要版本控制的概念，我并不想工具函数、cli、组件库。工具代码更新之后，在子包中立刻生效

```json
  "@yuan-shan/ui": "workspace:*",
  "@yuan-shan/tools": "workspace:*",
```

## 二、使用工具函数

使用 packages/tools 中的工具函数

```ts
import { add } from '@yuan-shan/tools'
add(1, 9)
```

## 三、使用公共组件

使用 packages/ui 中的公共组件

```ts
<script setup lang="ts">
import { YInput } from '@yuan-shan/ui'
</script>

<template>
  <div>
    <h1 class="test-h1">测试组件库</h1>
    <YInput />
  </div>
</template>·
```