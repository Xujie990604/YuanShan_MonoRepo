<template>
  <div class="device-overview-plugin-container">
    <div v-if="loading" class="loading">加载插件中...</div>
    <div v-else-if="error" class="error-placeholder">
      <div class="error-icon">⚠️</div>
      <div class="error-title">插件加载失败</div>
      <div class="error-message">{{ error }}</div>
      <div class="error-info">
        <div>组件名称：{{ componentName }}</div>
        <div>插件路径：{{ pluginUrl }}</div>
      </div>
    </div>
    <div ref="pluginContainer" v-show="!loading && !error"></div>
  </div>
</template>

<script>
import PluginLoader from '../utils/PluginLoader';
import { getPluginUrlByComponentName } from '../utils/pathHelper';

export default {
  name: 'DeviceOverviewPlugin',
  props: {
    componentName: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    // 根据 componentName 自动构建插件 URL
    pluginUrl() {
      return getPluginUrlByComponentName(this.componentName);
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      pluginLoader: new PluginLoader(),
      pluginElement: null
    };
  },
  async mounted() {
    await this.initPlugin();
    this.updatePluginData();
  },
  watch: {
    // 监听数据变化，更新插件
    data: {
      handler(newData) {
        if (newData && this.pluginElement) {
          this.updatePluginData();
        }
      },
      deep: true
    }
  },
  methods: {
    async initPlugin() {
      this.loading = true;
      this.error = null;

      try {
        // 加载插件
        await this.pluginLoader.loadPlugin({
          name: this.componentName,
          url: this.pluginUrl,
          componentName: this.componentName
        });

        // 创建插件实例
        this.pluginElement = this.pluginLoader.createPluginInstance(this.componentName);

        // 挂载到容器
        this.$refs.pluginContainer.appendChild(this.pluginElement);
      } catch (error) {
        console.error('Failed to load plugin:', error);
        this.error = error.message || '插件加载失败，请检查插件文件是否存在';
      } finally {
        this.loading = false;
      }
    },

    updatePluginData() {
      if (this.pluginElement && this.data) {
        // 更新插件数据
        this.pluginLoader.updatePluginData(this.pluginElement, this.data);
      }
    }
  },
  beforeDestroy() {
    // 清理插件实例
    if (this.$refs.pluginContainer && this.pluginElement) {
      try {
        this.$refs.pluginContainer.removeChild(this.pluginElement);
      } catch (e) {
        // 忽略错误
      }
    }
  }
};
</script>

<style scoped>
.device-overview-plugin-container {
  width: 100%;
  min-height: 200px;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error-placeholder {
  padding: 40px 20px;
  text-align: center;
  background: #fff3cd;
  border: 2px dashed #ffc107;
  border-radius: 8px;
  color: #856404;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #856404;
}

.error-message {
  font-size: 14px;
  margin-bottom: 16px;
  color: #856404;
  word-break: break-word;
}

.error-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ffc107;
  font-size: 12px;
  color: #856404;
  text-align: left;
  display: inline-block;
}

.error-info div {
  margin: 4px 0;
}
</style>
