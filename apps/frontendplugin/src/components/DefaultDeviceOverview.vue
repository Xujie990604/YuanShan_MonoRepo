<template>
  <div class="default-device-overview">
    <div class="header">
      <h3>{{ data.deviceInfo.name }}</h3>
      <span class="badge">默认组件</span>
    </div>
    
    <div class="content">
      <div class="info-section">
        <h4>设备信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">IP 地址：</span>
            <span class="value">{{ data.deviceInfo.ip }}:{{ data.deviceInfo.port }}</span>
          </div>
          <div class="info-item">
            <span class="label">设备型号：</span>
            <span class="value">{{ data.deviceInfo.model }}</span>
          </div>
          <div class="info-item">
            <span class="label">制造商：</span>
            <span class="value">{{ data.deviceInfo.manufacturer }}</span>
          </div>
          <div class="info-item">
            <span class="label">固件版本：</span>
            <span class="value">{{ data.deviceInfo.firmwareVersion }}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h4>时间信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">服务器时间：</span>
            <span class="value">{{ formatTime(data.timeInfo.serverTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">运行时长：</span>
            <span class="value">{{ formatUptime(data.timeInfo.uptime) }}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h4>摄像头信息</h4>
        <div class="camera-stats">
          <div class="stat-item">
            <span class="stat-label">总数</span>
            <span class="stat-value total">{{ data.cameras.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">在线</span>
            <span class="stat-value online">{{ data.cameras.online }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">离线</span>
            <span class="stat-value offline">{{ data.cameras.offline }}</span>
          </div>
        </div>
        <div class="camera-list">
          <div 
            v-for="camera in data.cameras.list" 
            :key="camera.id"
            class="camera-item"
            :class="{ 'offline': camera.status === 'offline' }"
          >
            <span class="camera-name">{{ camera.name }}</span>
            <span class="camera-status" :class="camera.status">
              {{ camera.status === 'online' ? '在线' : '离线' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DefaultDeviceOverview',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatTime(timeString) {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    formatUptime(seconds) {
      if (!seconds) return '-';
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${days}天 ${hours}小时 ${minutes}分钟`;
    }
  }
};
</script>

<style scoped>
.default-device-overview {
  border: 2px solid #42b983;
  border-radius: 6px;
  padding: 12px;
  background: #f9f9f9;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #42b983;
}

.header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.badge {
  background: #42b983;
  color: white;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-section {
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.info-section h4 {
  margin: 0 0 8px 0;
  color: #42b983;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  color: #666;
  margin-right: 8px;
}

.value {
  color: #333;
}

.camera-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: #f0f0f0;
  border-radius: 4px;
  min-width: 60px;
}

.stat-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.stat-value.total {
  color: #333;
}

.stat-value.online {
  color: #42b983;
}

.stat-value.offline {
  color: #e74c3c;
}

.camera-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.camera-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background: #f0f0f0;
  border-radius: 4px;
  min-width: 120px;
}

.camera-item.offline {
  opacity: 0.6;
}

.camera-name {
  font-size: 14px;
  color: #333;
}

.camera-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.camera-status.online {
  background: #42b983;
  color: white;
}

.camera-status.offline {
  background: #e74c3c;
  color: white;
}
</style>
