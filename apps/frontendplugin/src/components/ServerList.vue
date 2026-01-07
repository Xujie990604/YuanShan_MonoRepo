<template>
  <div class="server-list">
    <h1>设备概况列表</h1>
    <div class="server-items">
      <div 
        v-for="server in servers" 
        :key="server.serverId"
        class="server-item"
      >
        <h2>{{ server.serverName }}</h2>
        
        <!-- 应用内置组件渲染 -->
        <DefaultDeviceOverview 
          v-if="server.renderType === 'application'"
          :data="server.data"
        />
        
        <!-- Web Components 插件渲染 -->
        <DeviceOverviewPlugin
          v-else-if="server.renderType === 'plugin'"
          :component-name="server.componentName"
          :data="server.data"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mockDeviceData } from '../mock/deviceData';
import DefaultDeviceOverview from './DefaultDeviceOverview.vue';
import DeviceOverviewPlugin from './DeviceOverviewPlugin.vue';

export default {
  name: 'ServerList',
  components: {
    DefaultDeviceOverview,
    DeviceOverviewPlugin
  },
  data() {
    return {
      servers: mockDeviceData
    };
  }
};
</script>

<style scoped>
.server-list {
  padding: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.server-list h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 24px;
}

.server-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.server-item {
  background: white;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.server-item h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  font-size: 18px;
}
</style>
