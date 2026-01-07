# 打包说明

## 打包后运行注意事项

### 1. 插件路径处理

项目已经配置为使用 `process.env.BASE_URL` 来处理插件路径，这样可以确保：
- ✅ 开发环境：使用 `/plugins/...`（绝对路径）
- ✅ 生产环境：使用 `./plugins/...`（相对路径，适配子路径部署）

### 2. 打包命令

```bash
npm run build
```

打包后的文件会在 `dist` 目录下：
```
dist/
├── index.html
├── js/
├── css/
└── plugins/              # 插件文件会被复制到这里
    ├── device-overview-plugin-a.js
    └── device-overview-plugin-b.js
```

### 3. 部署方式

#### 方式一：根路径部署（推荐）
如果部署在网站根路径（如 `https://example.com/`），直接部署 `dist` 目录即可。

#### 方式二：子路径部署
如果部署在子路径（如 `https://example.com/app/`），需要：
1. 设置 `publicPath: '/app/'`（在 `vue.config.js` 中）
2. 或者使用相对路径 `publicPath: './'`（已配置）

### 4. 验证打包结果

打包后，检查以下内容：

1. **插件文件是否存在**
   ```bash
   ls dist/plugins/
   # 应该看到两个插件文件
   ```

2. **路径是否正确**
   - 打开 `dist/index.html`
   - 检查浏览器控制台，确认插件文件能正常加载
   - 如果看到 404 错误，检查路径配置

3. **测试运行**
   ```bash
   # 使用 serve 或 http-server 测试打包结果
   npx serve dist
   # 或
   npx http-server dist
   ```

### 5. 常见问题

#### 问题1：插件文件 404
**原因**：路径配置不正确
**解决**：检查 `vue.config.js` 中的 `publicPath` 配置

#### 问题2：插件加载失败
**原因**：CORS 问题或路径问题
**解决**：
- 确保插件文件在正确的位置
- 检查浏览器控制台的错误信息
- 如果使用 `file://` 协议打开，需要使用 HTTP 服务器

#### 问题3：BASE_URL 未定义
**原因**：Vue CLI 版本问题
**解决**：确保使用 Vue CLI 4.x 或更高版本

### 6. 生产环境配置示例

如果需要部署到特定路径，修改 `vue.config.js`：

```javascript
module.exports = {
  // 部署到子路径
  publicPath: process.env.NODE_ENV === 'production' 
    ? '/your-app-path/'  // 修改为你的部署路径
    : '/',
};
```

### 7. 静态资源服务器配置

如果使用 Nginx，确保配置正确：

```nginx
location / {
    root /path/to/dist;
    try_files $uri $uri/ /index.html;
}

# 确保插件文件可以被访问
location /plugins/ {
    root /path/to/dist;
    add_header Access-Control-Allow-Origin *;
}
```

## 测试清单

- [ ] 打包成功，无错误
- [ ] `dist/plugins/` 目录存在且包含两个插件文件
- [ ] 使用 HTTP 服务器测试，页面正常显示
- [ ] 三个服务器概况都能正常渲染
- [ ] 浏览器控制台无 404 或加载错误
- [ ] 插件样式正常显示
