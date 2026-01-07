/**
 * 插件加载器
 */
class PluginLoader {
  constructor() {
    this.loadedPlugins = new Set();
  }

  /**
   * 加载插件
   * @param {Object} config - 插件配置
   * @param {string} config.name - 插件名称
   * @param {string} config.url - 插件 JS 文件 URL
   * @param {string} config.componentName - Web Component 名称
   */
  async loadPlugin(config) {
    const { name, url, componentName } = config;
    
    // 检查是否已加载
    if (this.loadedPlugins.has(name)) {
      return;
    }

    // 动态加载 JS 文件
    await this.loadScript(url);
    
    // 检查组件是否已注册
    if (!customElements.get(componentName)) {
      throw new Error(`Component ${componentName} not found after loading plugin`);
    }

    this.loadedPlugins.add(name);
  }

  /**
   * 加载脚本
   * @param {string} url - 脚本 URL
   */
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      
      document.head.appendChild(script);
    });
  }

  /**
   * 创建插件实例
   * @param {string} componentName - Web Component 名称
   */
  createPluginInstance(componentName) {
    return document.createElement(componentName);
  }

  /**
   * 更新插件数据
   * @param {HTMLElement} element - 插件元素
   * @param {Object} data - 设备概况数据
   */
  updatePluginData(element, data) {
    // 通过 updateData 方法传递数据
    if (typeof element.updateData === 'function') {
      element.updateData(data);
    } else {
      console.warn('Plugin does not support updateData method');
    }
  }
}

export default PluginLoader;
