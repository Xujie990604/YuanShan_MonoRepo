# KeyDo 后端环境变量配置指南

## 📋 概述

KeyDo 后端使用不同的环境变量文件来区分开发和生产环境：

- **开发环境**: `.env.development`
- **生产环境**: `.env.production`
- **Prisma CLI**: `.env`（用于 Prisma 命令行工具）

## 🚀 快速配置

### 开发环境配置

```bash
# 1. 复制示例文件
cd server/keyDoServer
cp env.development.example .env.development

# 2. 复制 Prisma 配置（用于数据库迁移等命令）
cp env.development.example .env

# 3. 启动本地数据库
docker-compose up -d

# 4. 执行数据库迁移
cd ../..  # 回到 monorepo 根目录
pnpm --filter keydo-server prisma:generate
pnpm --filter keydo-server prisma:migrate

# 5. 启动开发服务器
pnpm --filter keydo-server dev
```

### 生产环境配置（非 Docker）

```bash
# 1. 复制示例文件
cd server/keyDoServer
cp env.production.example .env.production

# 2. 修改生产环境配置
# ⚠️ 必须修改以下配置项：
# - JWT_SECRET: 改为强随机字符串
# - DATABASE_URL: 改为生产数据库地址
# - CORS_ORIGIN: 改为实际的前端域名

nano .env.production  # 或使用其他编辑器

# 3. 复制为 .env（用于 Prisma CLI）
cp .env.production .env

# 4. 执行数据库迁移
pnpm --filter keydo-server prisma:migrate

# 5. 构建并启动
pnpm --filter keydo-server build
pnpm --filter keydo-server start:prod
```

### Docker 部署配置

使用 Docker Compose 部署时，环境变量在 `docker-compose.yml` 中配置，**不需要** `.env.production` 文件。

但仍建议创建 `.env.production` 作为参考和备份。

## 📝 环境变量说明

### 必需配置项

| 变量名 | 说明 | 示例 | 必须修改 |
|--------|------|------|---------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://user:pass@host:5432/db` | ✅ |
| `JWT_SECRET` | JWT 加密密钥 | `random-secret-string` | ✅ 生产环境 |
| `NODE_ENV` | 运行环境 | `development` / `production` | ❌ |
| `PORT` | 服务端口 | `6040` | ❌ |

### 可选配置项

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` |
| `CORS_ORIGIN` | CORS 白名单 | `*` |
| `LOG_LEVEL` | 日志级别 | `info` |

## 🔐 安全配置

### 生成强随机 JWT_SECRET

使用 Node.js 生成：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

使用 OpenSSL 生成：
```bash
openssl rand -hex 32
```

### DATABASE_URL 格式

```
postgresql://用户名:密码@主机:端口/数据库名?schema=public
```

示例：
- 开发环境: `postgresql://keydo:keydo123@localhost:5433/keydo_db?schema=public`
- Docker 环境: `postgresql://keydo:keydo123@postgres:5432/keydo_db?schema=public`
- 生产环境: `postgresql://prod_user:strong_pass@db.example.com:5432/prod_db?schema=public`

### CORS_ORIGIN 配置

多个域名用逗号分隔（不要有空格）：
```env
# ✅ 正确
CORS_ORIGIN="https://app.example.com,https://www.example.com"

# ❌ 错误（有空格）
CORS_ORIGIN="https://app.example.com, https://www.example.com"

# ⚠️ 开发环境可以使用（生产环境禁止）
CORS_ORIGIN="*"
```

## 🔄 环境切换

NestJS 会根据 `NODE_ENV` 自动加载对应的环境文件：

- `NODE_ENV=development` → 加载 `.env.development`
- `NODE_ENV=production` → 加载 `.env.production`
- `NODE_ENV=test` → 加载 `.env.test`

运行时指定环境：
```bash
# 开发环境
NODE_ENV=development pnpm dev

# 生产环境
NODE_ENV=production pnpm start:prod
```

## 📁 文件优先级

环境变量加载优先级（从高到低）：

1. **系统环境变量**（如 `export DATABASE_URL=...`）
2. **`.env.{环境}.local`**（不提交到 Git）
3. **`.env.{环境}`**（开发/生产环境配置）
4. **`.env.local`**（本地覆盖，不提交到 Git）
5. **`.env`**（默认配置，主要给 Prisma CLI 使用）

## 🎯 Prisma 特殊说明

Prisma CLI 工具（如 `prisma migrate`、`prisma studio`）**只读取 `.env` 文件**，不会读取 `.env.development` 或 `.env.production`。

因此需要：

**开发时**：
```bash
cp .env.development .env
pnpm prisma:migrate
```

**生产部署时**：
```bash
cp .env.production .env
pnpm prisma:migrate
```

**Docker 部署时**：
在 `docker-compose.yml` 中配置 `DATABASE_URL` 环境变量，容器内会自动使用。

## ⚠️ 安全注意事项

### 不要提交到 Git

确保 `.gitignore` 包含：
```gitignore
.env
.env.local
.env.development
.env.production
.env.*.local
```

### 生产环境检查清单

部署到生产环境前，确保：

- [ ] `JWT_SECRET` 已改为强随机字符串（32 位以上）
- [ ] 数据库密码已改为强密码
- [ ] `CORS_ORIGIN` 已限制为具体域名（不使用 `*`）
- [ ] `NODE_ENV` 设置为 `production`
- [ ] 数据库 URL 使用生产数据库
- [ ] 已配置 HTTPS（如果有域名）
- [ ] 已备份 `.env.production` 到安全位置

### 密钥管理建议

1. **开发环境**: 可以使用简单的密钥，放在 `.env.development` 中
2. **生产环境**: 
   - 使用密钥管理服务（如 AWS Secrets Manager、HashiCorp Vault）
   - 或通过系统环境变量注入
   - 不要将生产密钥写在文件中提交到 Git

## 🛠️ 故障排查

### 问题 1: Prisma 找不到数据库

**原因**: `.env` 文件不存在或 `DATABASE_URL` 配置错误

**解决**:
```bash
# 检查 .env 文件是否存在
ls -la server/keyDoServer/.env

# 检查 DATABASE_URL 是否正确
cat server/keyDoServer/.env | grep DATABASE_URL

# 重新创建
cp server/keyDoServer/env.development.example server/keyDoServer/.env
```

### 问题 2: NestJS 使用了错误的环境

**原因**: `NODE_ENV` 未设置或设置错误

**解决**:
```bash
# 检查当前环境
echo $NODE_ENV

# 临时设置
export NODE_ENV=development

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export NODE_ENV=development' >> ~/.bashrc
```

### 问题 3: CORS 错误

**原因**: `CORS_ORIGIN` 配置不正确

**解决**:
```bash
# 检查配置
cat server/keyDoServer/.env.development | grep CORS_ORIGIN

# 确保前端地址在白名单中
# 开发环境可以临时使用 * 测试
CORS_ORIGIN="*"
```

### 问题 4: JWT Token 无效

**原因**: 生产环境和开发环境使用了不同的 `JWT_SECRET`

**解决**:
- 确保同一环境下 `JWT_SECRET` 不变
- 清除客户端的 Token，重新登录

## 📞 需要帮助？

如果遇到配置问题：

1. 检查 `.env` 文件是否存在
2. 检查环境变量格式是否正确（没有多余空格、引号）
3. 检查 `NODE_ENV` 是否正确
4. 查看应用启动日志

更多信息请参考：
- [NestJS Configuration 文档](https://docs.nestjs.com/techniques/configuration)
- [Prisma Environment Variables 文档](https://www.prisma.io/docs/guides/development-environment/environment-variables)
