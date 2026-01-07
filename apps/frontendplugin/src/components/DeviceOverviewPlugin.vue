<template>
  <div class="device-overview-plugin-container">
    <div v-if="loading" class="loading">加载插件中...</div>
    <div ref="pluginContainer" v-show="!loading"></div>
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
</style>
