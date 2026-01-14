# KeyDo 项目 Docker 部署方案 🚀

> **部署目录说明**：此目录包含 KeyDo 项目（前端 + 后端 + 数据库）的完整 Docker 部署配置

## 📦 目录结构

```
deployments/keydo/
├── docker-compose.yml       # Docker Compose 编排文件
├── Dockerfile.backend       # 后端 Dockerfile
├── Dockerfile.frontend      # 前端 Dockerfile
├── nginx.conf              # Nginx 配置
├── .dockerignore           # Docker 忽略文件
├── deploy.sh               # 一键部署脚本
└── README.md               # 本文件
```

## 🚀 快速开始

### 方法 1：使用一键部署脚本（推荐）

```bash
# 1. 进入部署目录
cd deployments/keydo

# 2. 给脚本添加执行权限
chmod +x deploy.sh

# 3. 运行部署脚本
./deploy.sh

# 4. 选择 "1) 首次部署"
# 等待构建完成（首次需要 5-10 分钟）
```

### 方法 2：手动部署

```bash
# 1. 进入部署目录
cd deployments/keydo

# 2. 构建镜像
docker-compose build

# 3. 启动所有容器
docker-compose up -d

# 4. 查看状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

## 🌐 访问服务

部署完成后：

- **前端页面**: http://localhost:3000
- **后端 API**: http://localhost:6040/api/v1
- **数据库**: localhost:5432 (用户: keydo, 密码: keydo123)

如果部署在云服务器上，将 `localhost` 替换为服务器 IP。


## 🛠️ 常用命令

```bash
# 进入部署目录（重要！）
cd deployments/keydo

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

## 🏗️ 架构说明

### 服务组成

| 服务 | 容器名 | 端口 | 说明 |
|------|--------|------|------|
| frontend | keydo-frontend | 3000:80 | Nginx + React 静态文件 |
| backend | keydo-backend | 6040:6040 | NestJS API 服务 |
| postgres | keydo-postgres | 5432:5432 | PostgreSQL 16 数据库 |






