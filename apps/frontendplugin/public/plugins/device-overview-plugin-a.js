/**
 * 第三方插件 A - 横向卡片布局
 */
class DeviceOverviewPluginA extends HTMLElement {
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 12px;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
        }
        .content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 6px;
          padding: 10px;
        }
        .card-title {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 6px;
        }
        .card-value {
          font-size: 16px;
          font-weight: bold;
        }
        .ip-value {
          font-family: 'Courier New', monospace;
        }
        .camera-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 6px;
          margin-top: 8px;
        }
        .camera-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 5px;
          border-radius: 4px;
          text-align: center;
          font-size: 11px;
        }
        .camera-badge.offline {
          opacity: 0.5;
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
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatUptime = (seconds) => {
      if (!seconds) return '-';
      const days = Math.floor(seconds / 86400);
      return `${days}天`;
    };

    const container = this.shadowRoot.querySelector('.container');
    container.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 12px;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
        }
        .content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 6px;
          padding: 10px;
        }
        .card-title {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 6px;
        }
        .card-value {
          font-size: 16px;
          font-weight: bold;
        }
        .ip-value {
          font-family: 'Courier New', monospace;
        }
        .camera-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 6px;
          margin-top: 8px;
        }
        .camera-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 5px;
          border-radius: 4px;
          text-align: center;
          font-size: 11px;
        }
        .camera-badge.offline {
          opacity: 0.5;
        }
      </style>
      <div class="header">
        <h3 class="title">${data.deviceInfo.name}</h3>
        <span class="badge">插件A</span>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-title">IP 地址</div>
          <div class="card-value ip-value">${data.deviceInfo.ip}:${data.deviceInfo.port}</div>
        </div>
        <div class="card">
          <div class="card-title">服务器时间</div>
          <div class="card-value">${formatTime(data.timeInfo.serverTime)}</div>
        </div>
        <div class="card">
          <div class="card-title">运行时长</div>
          <div class="card-value">${formatUptime(data.timeInfo.uptime)}</div>
        </div>
        <div class="card">
          <div class="card-title">摄像头总数</div>
          <div class="card-value">${data.cameras.total}</div>
        </div>
        <div class="card">
          <div class="card-title">在线</div>
          <div class="card-value">${data.cameras.online}</div>
        </div>
        <div class="card">
          <div class="card-title">离线</div>
          <div class="card-value">${data.cameras.offline}</div>
        </div>
        <div class="camera-grid">
          ${data.cameras.list.map(cam => `
            <div class="camera-badge ${cam.status === 'offline' ? 'offline' : ''}">
              ${cam.name}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// 注册自定义元素
customElements.define('device-overview-plugin-a', DeviceOverviewPluginA);
