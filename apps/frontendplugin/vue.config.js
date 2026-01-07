/**
 * Vue CLI 配置文件
 * 确保 public 目录下的插件文件在打包时正确复制
 */
module.exports = {
  /**
   * publicPath 配置说明：
   * 
   * 1. 开发环境：'/' - 开发服务器在根路径
   * 
   * 2. 生产环境两种选择：
   *    - './' (相对路径) - 推荐，可部署到任意路径，无需重新构建
   *    - '/app/' (绝对路径) - 固定部署路径，路径明确但不够灵活
   * 
   * 3. 如果需要部署到固定路径，可以改为：
   *    publicPath: process.env.NODE_ENV === 'production' ? '/your-path/' : '/'
   * 
   * 4. 或者通过环境变量配置：
   *    publicPath: process.env.VUE_APP_PUBLIC_PATH || (process.env.NODE_ENV === 'production' ? './' : '/')
   */
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  
  // 构建配置
  configureWebpack: {
    // 确保插件文件不被 webpack 处理，直接复制
  },
  
  // 链式配置
  chainWebpack: config => {
    // 确保 public 目录下的文件被正确复制
    // Vue CLI 默认会处理，这里只是确保配置正确
  }
};
