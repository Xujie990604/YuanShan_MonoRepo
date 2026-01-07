/**
 * 第三方插件 B - 垂直列表布局
 */
class DeviceOverviewPluginB extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = null;
  }

  connectedCallback() {
    this.render();
    if (this._data) {
      this.renderData(this._data);
    }
  }

  updateData(data) {
    this._data = data;
    this.renderData(data);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Arial', sans-serif;
        }
        .container {
          background: #fff;
          border: 3px solid #ff6b6b;
          border-radius: 6px;
          padding: 12px;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 2px dashed #ff6b6b;
        }
        .icon {
          width: 32px;
          height: 32px;
          background: #ff6b6b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        .title {
          flex: 1;
          font-size: 16px;
          font-weight: bold;
          color: #2c3e50;
        }
        .badge {
          background: #ff6b6b;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
        }
        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #666;
          min-width: 100px;
        }
        .info-value {
          color: #333;
          text-align: right;
          flex: 1;
        }
        .info-value.ip-clickable {
          cursor: pointer;
          text-decoration: underline;
          color: #ff6b6b;
          transition: opacity 0.2s;
        }
        .info-value.ip-clickable:hover {
          opacity: 0.8;
        }
        .camera-section {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #ff6b6b;
        }
        .camera-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .camera-stats {
          display: flex;
          gap: 10px;
        }
        .stat {
          text-align: center;
        }
        .stat-number {
          display: block;
          font-size: 18px;
          font-weight: bold;
          color: #ff6b6b;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
        }
        .camera-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .camera-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 10px;
          background: #f8f8f8;
          border-radius: 4px;
          border-left: 4px solid #ff6b6b;
        }
        .camera-row.offline {
          opacity: 0.6;
          border-left-color: #999;
        }
        .camera-name {
          font-size: 14px;
          color: #333;
        }
        .camera-status {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 3px;
        }
        .camera-status.online {
          background: #51cf66;
          color: white;
        }
        .camera-status.offline {
          background: #999;
          color: white;
        }
      </style>
      <div class="container">
        <div>等待数据...</div>
      </div>
    `;
  }

  renderData(data) {
    if (!data) return;
    
    const formatTime = (timeString) => {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const formatUptime = (seconds) => {
      if (!seconds) return '-';
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}天 ${hours}小时`;
    };

    const container = this.shadowRoot.querySelector('.container');
    container.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Arial', sans-serif;
        }
        .container {
          background: #fff;
          border: 3px solid #ff6b6b;
          border-radius: 6px;
          padding: 12px;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 2px dashed #ff6b6b;
        }
        .icon {
          width: 32px;
          height: 32px;
          background: #ff6b6b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        .title {
          flex: 1;
          font-size: 16px;
          font-weight: bold;
          color: #2c3e50;
        }
        .badge {
          background: #ff6b6b;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
        }
        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #666;
          min-width: 100px;
        }
        .info-value {
          color: #333;
          text-align: right;
          flex: 1;
        }
        .info-value.ip-clickable {
          cursor: pointer;
          text-decoration: underline;
          color: #ff6b6b;
          transition: opacity 0.2s;
        }
        .info-value.ip-clickable:hover {
          opacity: 0.8;
        }
        .camera-section {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #ff6b6b;
        }
        .camera-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .camera-stats {
          display: flex;
          gap: 10px;
        }
        .stat {
          text-align: center;
        }
        .stat-number {
          display: block;
          font-size: 18px;
          font-weight: bold;
          color: #ff6b6b;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
        }
        .camera-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .camera-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 10px;
          background: #f8f8f8;
          border-radius: 4px;
          border-left: 4px solid #ff6b6b;
        }
        .camera-row.offline {
          opacity: 0.6;
          border-left-color: #999;
        }
        .camera-name {
          font-size: 14px;
          color: #333;
        }
        .camera-status {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 3px;
        }
        .camera-status.online {
          background: #51cf66;
          color: white;
        }
        .camera-status.offline {
          background: #999;
          color: white;
        }
      </style>
      <div class="header">
        <div class="icon">B</div>
        <div class="title">${data.deviceInfo.name}</div>
        <span class="badge">插件B</span>
      </div>
      <ul class="info-list">
        <li class="info-item">
          <span class="info-label">IP 地址</span>
          <span class="info-value ip-clickable" data-ip="${data.deviceInfo.ip}" data-port="${data.deviceInfo.port}">${data.deviceInfo.ip}:${data.deviceInfo.port}</span>
        </li>
        <li class="info-item">
          <span class="info-label">设备型号</span>
          <span class="info-value">${data.deviceInfo.model}</span>
        </li>
        <li class="info-item">
          <span class="info-label">制造商</span>
          <span class="info-value">${data.deviceInfo.manufacturer}</span>
        </li>
        <li class="info-item">
          <span class="info-label">固件版本</span>
          <span class="info-value">${data.deviceInfo.firmwareVersion}</span>
        </li>
        <li class="info-item">
          <span class="info-label">服务器时间</span>
          <span class="info-value">${formatTime(data.timeInfo.serverTime)}</span>
        </li>
        <li class="info-item">
          <span class="info-label">运行时长</span>
          <span class="info-value">${formatUptime(data.timeInfo.uptime)}</span>
        </li>
      </ul>
      <div class="camera-section">
        <div class="camera-header">
          <h4 style="margin: 0; color: #2c3e50;">摄像头列表</h4>
          <div class="camera-stats">
            <div class="stat">
              <span class="stat-number">${data.cameras.total}</span>
              <span class="stat-label">总数</span>
            </div>
            <div class="stat">
              <span class="stat-number" style="color: #51cf66;">${data.cameras.online}</span>
              <span class="stat-label">在线</span>
            </div>
            <div class="stat">
              <span class="stat-number" style="color: #999;">${data.cameras.offline}</span>
              <span class="stat-label">离线</span>
            </div>
          </div>
        </div>
        <div class="camera-list">
          ${data.cameras.list.map(cam => `
            <div class="camera-row ${cam.status === 'offline' ? 'offline' : ''}">
              <span class="camera-name">${cam.name}</span>
              <span class="camera-status ${cam.status}">${cam.status === 'online' ? '在线' : '离线'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // 绑定 IP 地址点击事件
    const ipElement = container.querySelector('.ip-clickable');
    if (ipElement) {
      ipElement.addEventListener('click', () => {
        // 触发自定义事件，通知主应用
        this.dispatchEvent(new CustomEvent('ip-click', {
          detail: {
            ip: data.deviceInfo.ip,
            port: data.deviceInfo.port,
            serverId: data.deviceInfo.id,
            serverName: data.deviceInfo.name
          },
          bubbles: true, // 允许事件冒泡到主应用
          composed: true // 允许事件穿透 Shadow DOM
        }));
      });
    }
  }
}

// 注册自定义元素
customElements.define('device-overview-plugin-b', DeviceOverviewPluginB);
