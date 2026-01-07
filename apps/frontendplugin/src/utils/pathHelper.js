/**
 * 路径辅助工具
 * 用于处理插件路径，确保开发和生产环境都能正常工作
 */

/**
 * 根据组件名称获取插件文件的完整路径
 * 默认从 /plugins 目录下查找同名 JS 文件
 * @param {string} componentName - Web Component 名称，如 'device-overview-plugin-a'
 * @returns {string} 完整的插件路径，如 '/plugins/device-overview-plugin-a.js' 或 './plugins/device-overview-plugin-a.js'
 */
export function getPluginUrlByComponentName(componentName) {
  // Vue CLI 会在构建时注入 BASE_URL
  // 开发环境：BASE_URL = '/'
  // 生产环境：BASE_URL = './' 或配置的 publicPath
  const baseUrl = process.env.BASE_URL || '/';
  
  // 构建插件路径：/plugins/{componentName}.js
  const pluginPath = `plugins/${componentName}.js`;
  
  // 确保 baseUrl 和 pluginPath 正确拼接
  if (baseUrl.endsWith('/')) {
    return baseUrl + pluginPath;
  } else {
    return baseUrl + '/' + pluginPath;
  }
}
