# 设备概况插件化 DEMO

## 项目结构

```
apps/frontendplugin/
├── public/
│   └── plugins/                    # Web Components 插件目录
│       ├── device-overview-plugin-a.js  # 插件A（横向卡片布局）
│       └── device-overview-plugin-b.js  # 插件B（垂直列表布局）
├── src/
│   ├── components/
│   │   ├── ServerList.vue           # 主应用列表组件
│   │   ├── DefaultDeviceOverview.vue # 默认 Vue 组件（第一个服务器）
│   │   └── DeviceOverviewPlugin.vue  # 插件容器组件
│   ├── mock/
│   │   └── deviceData.js            # Mock 数据（三个服务器）
│   ├── utils/
│   │   └── PluginLoader.js          # 插件加载器
│   ├── App.vue
│   └── main.js
└── package.json
```

## 功能说明

### 1. 三个服务器展示

- **服务器1（主服务器）**：使用 Vue 组件 `DefaultDeviceOverview.vue` 渲染
  - 布局：网格布局，包含设备信息、时间信息、摄像头统计和列表
  - 样式：绿色主题，卡片式布局

- **服务器2（第三方服务器A）**：使用 Web Components 插件 `device-overview-plugin-a.js` 渲染
  - 布局：横向卡片布局，渐变紫色背景
  - 样式：现代化卡片设计，摄像头以网格展示

- **服务器3（第三方服务器B）**：使用 Web Components 插件 `device-overview-plugin-b.js` 渲染
  - 布局：垂直列表布局，红色边框主题
  - 样式：列表式设计，摄像头以行展示

### 2. 数据流

1. 主应用从 `mock/deviceData.js` 获取三个服务器的数据
2. 主应用根据 `pluginType` 决定使用哪种渲染方式：
   - `vue`: 使用 Vue 组件
   - `plugin-a`: 使用插件A
   - `plugin-b`: 使用插件B
3. 对于插件，主应用通过 `DeviceOverviewPlugin.vue` 加载插件并传递数据

### 3. 插件加载机制

- 插件文件位于 `public/plugins/` 目录
- `PluginLoader` 负责动态加载插件 JS 文件
- 插件通过 `data` 属性接收 JSON 字符串格式的数据
- 插件也可以实现 `updateData()` 方法接收数据对象

## 运行方式

```bash
# 安装依赖（如果需要）
npm install

# 启动开发服务器
npm run serve
```

访问 `http://localhost:8080` 即可看到 DEMO。

## 插件开发示例

### 插件A（device-overview-plugin-a.js）

- 使用渐变紫色背景
- 横向卡片布局
- 摄像头以网格形式展示

### 插件B（device-overview-plugin-b.js）

- 使用红色边框主题
- 垂直列表布局
- 摄像头以行形式展示

### 插件接口规范

```javascript
class DeviceOverviewPluginX extends HTMLElement {
  static get observedAttributes() {
    return ['data'];  // 监听 data 属性变化
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data') {
      const data = JSON.parse(newValue);
      this.renderData(data);
    }
  }

  // 可选：通过方法更新数据
  updateData(data) {
    this.renderData(data);
  }

  renderData(data) {
    // 渲染逻辑
    // data 包含：deviceInfo, timeInfo, cameras
  }
}

customElements.define('device-overview-plugin-x', DeviceOverviewPluginX);
```

## 数据格式

```javascript
{
  deviceInfo: {
    id: string,
    name: string,
    ip: string,
    port: number,
    model: string,
    manufacturer: string,
    firmwareVersion: string
  },
  timeInfo: {
    serverTime: string,  // ISO 8601 格式
    timezone: string,
    uptime: number       // 秒
  },
  cameras: {
    total: number,
    online: number,
    offline: number,
    list: Array<{
      id: string,
      name: string,
      status: 'online' | 'offline',
      channel: number,
      resolution: string
    }>
  }
}
```

## 注意事项

1. 插件文件需要放在 `public/plugins/` 目录，这样可以通过相对路径访问
2. 插件必须注册为自定义元素，名称必须以 `device-overview-` 开头
3. 插件通过 Shadow DOM 实现样式隔离
4. 当前 DEMO 阶段不处理错误情况，仅展示核心功能
