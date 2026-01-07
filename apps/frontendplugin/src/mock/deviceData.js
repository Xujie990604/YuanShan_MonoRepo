/**
 * Mock 设备概况数据
 */

export const mockDeviceData = [
  {
    serverId: 'server-001',
    serverName: '主服务器',
    renderType: 'application', // 使用应用内置组件渲染
    data: {
      deviceInfo: {
        id: 'server-001',
        name: '主服务器',
        ip: '192.168.1.100',
        port: 8000,
        model: 'NVR-5000',
        manufacturer: 'YuanShan',
        firmwareVersion: 'v2.1.0'
      },
      timeInfo: {
        serverTime: '2024-01-15T10:30:00+08:00',
        timezone: 'Asia/Shanghai',
        uptime: 86400
      },
      cameras: {
        total: 16,
        online: 14,
        offline: 2,
        list: [
          { id: 'cam-001', name: '摄像头-01', status: 'online', channel: 1, resolution: '1920x1080' },
          { id: 'cam-002', name: '摄像头-02', status: 'online', channel: 2, resolution: '1920x1080' },
          { id: 'cam-003', name: '摄像头-03', status: 'offline', channel: 3, resolution: '1280x720' },
          { id: 'cam-004', name: '摄像头-04', status: 'online', channel: 4, resolution: '1920x1080' }
        ]
      }
    }
  },
  {
    serverId: 'server-002',
    serverName: '第三方服务器A',
    renderType: 'plugin', // 使用插件渲染
    componentName: 'device-overview-plugin-a',
    data: {
      deviceInfo: {
        id: 'server-002',
        name: '第三方服务器A',
        ip: '192.168.1.101',
        port: 8080,
        model: 'NVR-3000',
        manufacturer: 'Partner-A',
        firmwareVersion: 'v1.5.2'
      },
      timeInfo: {
        serverTime: '2024-01-15T10:30:15+08:00',
        timezone: 'Asia/Shanghai',
        uptime: 172800
      },
      cameras: {
        total: 8,
        online: 8,
        offline: 0,
        list: [
          { id: 'cam-a-001', name: 'A摄像头-01', status: 'online', channel: 1, resolution: '1920x1080' },
          { id: 'cam-a-002', name: 'A摄像头-02', status: 'online', channel: 2, resolution: '1920x1080' }
        ]
      }
    }
  },
  {
    serverId: 'server-003',
    serverName: '第三方服务器B',
    renderType: 'plugin', // 使用插件渲染
    componentName: 'device-overview-plugin-b',
    data: {
      deviceInfo: {
        id: 'server-003',
        name: '第三方服务器B',
        ip: '192.168.1.102',
        port: 9000,
        model: 'NVR-2000',
        manufacturer: 'Partner-B',
        firmwareVersion: 'v1.2.0'
      },
      timeInfo: {
        serverTime: '2024-01-15T10:30:30+08:00',
        timezone: 'Asia/Shanghai',
        uptime: 259200
      },
      cameras: {
        total: 12,
        online: 10,
        offline: 2,
        list: [
          { id: 'cam-b-001', name: 'B摄像头-01', status: 'online', channel: 1, resolution: '1920x1080' },
          { id: 'cam-b-002', name: 'B摄像头-02', status: 'online', channel: 2, resolution: '1280x720' },
          { id: 'cam-b-003', name: 'B摄像头-03', status: 'offline', channel: 3, resolution: '1920x1080' }
        ]
      }
    }
  },
  {
    serverId: 'server-004',
    serverName: '第三方服务器C（插件缺失）',
    renderType: 'plugin', // 使用插件渲染
    componentName: 'device-overview-plugin-c', // 这个插件文件不存在，用于测试错误处理
    data: {
      deviceInfo: {
        id: 'server-004',
        name: '第三方服务器C',
        ip: '192.168.1.103',
        port: 7000,
        model: 'NVR-1000',
        manufacturer: 'Partner-C',
        firmwareVersion: 'v1.0.0'
      },
      timeInfo: {
        serverTime: '2024-01-15T10:30:45+08:00',
        timezone: 'Asia/Shanghai',
        uptime: 345600
      },
      cameras: {
        total: 4,
        online: 3,
        offline: 1,
        list: [
          { id: 'cam-c-001', name: 'C摄像头-01', status: 'online', channel: 1, resolution: '1920x1080' },
          { id: 'cam-c-002', name: 'C摄像头-02', status: 'offline', channel: 2, resolution: '1280x720' }
        ]
      }
    }
  }
];
