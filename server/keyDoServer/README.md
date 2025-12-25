## KeyDo Server（精简版开发说明）

基于 **NestJS + PostgreSQL + Prisma** 的后端服务，只保留开发阶段必需信息。

---

### 1. 环境要求

- Node.js 20.x  
- pnpm（monorepo 根目录统一安装依赖）  
- PostgreSQL：推荐使用 Docker / Podman + `docker-compose` / `podman-compose`

---

### 2. 本地快速启动（开发）

在 monorepo 根目录：

```bash
cd C:/Users/admin/Desktop/YuanShan/YuanShan_Monorepo

# 安装依赖（只需要执行一次）
pnpm install

# 启动数据库（在 server/keyDoServer 目录）
cd server/keyDoServer
podman-compose up -d   # 或 docker-compose up -d
```

准备环境变量（用于 Prisma 和应用）：

```bash
# 在 server/keyDoServer 下
# Prisma 使用 .env 读取 DATABASE_URL
echo DATABASE_URL="postgresql://keydo:keydo123@localhost:5433/keydo_db?schema=public" > .env
```

在 monorepo 根目录启动后端服务：

```bash
cd C:/Users/admin/Desktop/YuanShan/YuanShan_Monorepo

pnpm --filter keydo-server prisma:generate
pnpm --filter keydo-server prisma:migrate
pnpm --filter keydo-server dev
```

访问：

- 接口服务：`http://localhost:6040`

---

### 3. 常用开发命令（pnpm）

在 monorepo 根目录执行：

```bash
pnpm --filter keydo-server dev             # 启动开发服务器
pnpm --filter keydo-server build           # 构建
pnpm --filter keydo-server start:prod      # 启动生产构建

pnpm --filter keydo-server prisma:generate # 生成 Prisma Client
pnpm --filter keydo-server prisma:migrate  # 数据库迁移
pnpm --filter keydo-server prisma:studio   # 打开 Prisma Studio

pnpm --filter keydo-server lint            # 代码检查
pnpm --filter keydo-server format          # 代码格式化
```

---

### 4. 项目结构（简略）

```txt
server/keyDoServer/
├── src/
│   ├── auth/           # 认证模块
│   ├── user/           # 用户模块
│   ├── prisma/         # Prisma 服务
│   ├── common/         # 拦截器 / 过滤器 / 装饰器
│   ├── app.module.ts   # 根模块
│   └── main.ts         # 入口
├── prisma/
│   └── schema.prisma   # 数据库模型
└── docker-compose.yml  # 本地 Postgres
```

---

### 5. 必要环境变量（开发）

应用运行时建议在 `server/keyDoServer` 目录增加 `.env.development`（由 Nest 读取）：

```env
DATABASE_URL="postgresql://keydo:keydo123@localhost:5433/keydo_db?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=6040
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

后续有更多需求（部署、运维、架构说明等）可以再逐步补充单独文档。 
