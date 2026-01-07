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
          @plugin-event="handlePluginEvent"
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
      servers: JSON.parse(JSON.stringify(mockDeviceData)), // 深拷贝，避免修改原始数据
      updateTimer: null
    };
  },
  mounted() {
    // 启动定时更新，每 3 秒更新一次数据
    this.startDataUpdate();
  },
  beforeDestroy() {
    // 清除定时器
    this.stopDataUpdate();
  },
  methods: {
    /**
     * 启动数据更新定时器
     */
    startDataUpdate() {
      this.updateTimer = setInterval(() => {
        this.updateServerData();
      }, 1000); // 每 1 秒更新一次
    },

    /**
     * 停止数据更新定时器
     */
    stopDataUpdate() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }
    },

    /**
     * 更新服务器数据（模拟数据变化）
     */
    updateServerData() {
      this.servers.forEach((server, index) => {
        // 创建新的数据对象，确保 Vue 能检测到变化
        const newData = JSON.parse(JSON.stringify(server.data));
        
        // 更新服务器时间（当前时间）
        const now = new Date();
        newData.timeInfo.serverTime = now.toISOString();
        
        // 更新运行时长（每次增加 3 秒）
        if (newData.timeInfo.uptime) {
          newData.timeInfo.uptime += 3;
        }

        // 随机更新摄像头在线/离线状态（模拟摄像头状态变化）
        if (newData.cameras.list && newData.cameras.list.length > 0) {
          newData.cameras.list.forEach(camera => {
            // 10% 的概率切换状态
            if (Math.random() < 0.1) {
              camera.status = camera.status === 'online' ? 'offline' : 'online';
            }
          });

          // 重新计算在线/离线数量
          newData.cameras.online = newData.cameras.list.filter(
            cam => cam.status === 'online'
          ).length;
          newData.cameras.offline = newData.cameras.list.filter(
            cam => cam.status === 'offline'
          ).length;
        }

        // 随机更新 IP 地址的最后一位（模拟网络变化）
        if (Math.random() < 0.2) {
          const ipParts = newData.deviceInfo.ip.split('.');
          ipParts[3] = Math.floor(Math.random() * 255);
          newData.deviceInfo.ip = ipParts.join('.');
        }

        // 使用 Vue.set 确保响应式更新
        this.$set(this.servers[index], 'data', newData);
      });
    },

    /**
     * 处理插件事件
     * @param {Object} eventData - 事件数据
     * @param {string} eventData.type - 事件类型
     * @param {Object} eventData.detail - 事件详情
     */
    handlePluginEvent(eventData) {
      const { type, detail } = eventData;
      
      if (type === 'ip-click') {
        // 处理 IP 地址点击事件
        this.handleIpClick(detail);
      }
    },

    /**
     * 处理 IP 地址点击
     * @param {Object} detail - IP 点击事件详情
     */
    handleIpClick(detail) {
      const { ip, port, serverId, serverName } = detail;
      const address = `${ip}:${port}`;
      
      // 这里可以执行各种操作，比如：
      // 1. 显示提示信息
      alert(`点击了服务器 "${serverName}" 的 IP 地址：${address}\n服务器ID：${serverId}`);
      
      // 2. 或者打开新窗口
      // window.open(`http://${address}`, '_blank');
      
      // 3. 或者复制到剪贴板
      // navigator.clipboard.writeText(address);
      
      // 4. 或者跳转到详情页
      // this.$router.push(`/server/${serverId}`);
      
      console.log('IP 点击事件:', detail);
    }
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
