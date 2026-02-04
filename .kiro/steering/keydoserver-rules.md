---
inclusion: fileMatch
fileMatchPattern: "server/keyDoServer/**/*"
---

# keyDoServer 项目规则

## 技术栈

1. **NestJS 10.x** + TypeScript 5.x
2. **PostgreSQL** 数据库
3. **Prisma 5.x** ORM
4. **JWT** 认证（使用 `@nestjs/jwt` + `passport-jwt`）
5. **Zod 3.x** 数据验证（替代 class-validator）
6. **bcryptjs** 密码加密（纯 JavaScript 实现，避免原生模块问题）
7. **@yuan-shan/keydo-contract** 前后端共享类型和 Schema

## 项目结构

```
server/keyDoServer/
├── src/
│   ├── auth/                    # 认证模块
│   ├── user/                    # 用户模块
│   ├── prisma/                  # Prisma 服务
│   ├── common/                  # 通用模块
│   ├── app.module.ts            # 根模块
│   └── main.ts                  # 应用入口
├── prisma/
│   ├── schema.prisma            # 数据库模型定义
│   └── migrations/              # 数据库迁移文件
└── docker-compose.yml           # 本地 PostgreSQL 容器配置
```

## 类型和验证规范（重要）

### ⚠️ 核心原则

**前后端类型和验证统一使用 `@yuan-shan/keydo-contract` 包管理**

#### 基本原则

- ✅ **必须从 `@yuan-shan/keydo-contract` 导入 API 相关的类型和 Schema**
- ✅ 所有与前端共享的类型（请求参数、响应数据）都在 `keyDoContract` 中定义
- ✅ 使用 `keyDoContract` 中的 Zod Schema 进行请求参数验证
- ❌ **禁止在后端项目中重复定义与前端共享的类型**
- ❌ 禁止手动定义 DTO 类或接口（除非是纯后端内部使用的类型）
- ❌ 禁止使用 `class-validator` 进行验证（已移除，统一使用 Zod）

#### 使用方式

**1. 导入类型和 Schema**

```typescript
// ✅ 正确：从 keyDoContract 导入
import { 
  signinSchema, 
  signupSchema, 
  SigninInput, 
  SignupInput,
  SigninResponse,
  SignupResponse 
} from '@yuan-shan/keydo-contract';

// ❌ 错误：不要自己定义类型
// interface SigninDto { username: string; password: string; } // 禁止！
```

**2. Controller 中使用 Zod 验证**

```typescript
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { signinSchema, SigninInput } from '@yuan-shan/keydo-contract';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  @Post('signin')
  @Public()
  @UsePipes(new ZodValidationPipe(signinSchema))  // 使用共享的 Schema
  async signin(@Body() signinDto: SigninInput) {  // 使用共享的类型
    return this.authService.signin(signinDto);
  }
}
```

**3. Service 中使用共享类型**

```typescript
import { SigninInput, SignupInput, SigninResponse } from '@yuan-shan/keydo-contract';

@Injectable()
export class AuthService {
  async signin(signinDto: SigninInput): Promise<SigninResponse> {
    // 业务逻辑
    return { access_token, userId };
  }
}
```

**4. 添加新接口时的流程**

1. 在 `packages/keyDoContract/src/` 中定义新的类型和 Schema
2. 在 `packages/keyDoContract` 中执行 `pnpm build`
3. 在后端 Controller 中导入并使用 Schema 和类型

## 代码规范

### 模块化设计

- 每个功能模块独立（auth、user 等）
- 每个模块包含：`*.module.ts`、`*.service.ts`、`*.controller.ts`
- 通用功能放在 `common/` 目录

### Controller 规范

- Controller 只负责接收请求和返回响应
- 业务逻辑放在 Service 中
- 使用 `@UsePipes(new ZodValidationPipe(schema))` 进行参数验证
- 使用 `@Public()` 装饰器标记公开接口（不需要 JWT 认证）

### Service 规范

- Service 包含业务逻辑
- 使用 PrismaService 进行数据库操作
- 返回类型使用 `keyDoContract` 中定义的响应类型
- 方法参数使用 `keyDoContract` 中定义的输入类型

### 异常处理

- 使用 NestJS 内置异常类：`BadRequestException`、`UnauthorizedException`、`NotFoundException` 等
- 全局异常过滤器（`HttpExceptionFilter`）统一处理异常并格式化响应
- **异常 stack 信息只在控制台输出，不返回给客户端**

### 响应格式

全局拦截器（`TransformInterceptor`）统一格式化成功响应：
```typescript
{
  code: 200,
  message: "success",
  data: <实际数据>
}
```

异常响应格式（由 `HttpExceptionFilter` 处理）：
```typescript
{
  code: <HTTP状态码>,
  message: "<错误信息>",
  data: null
}
```

### 认证和授权

- 使用 JWT 进行认证
- `JwtAuthGuard` 作为全局守卫（在 `app.module.ts` 中注册）
- 使用 `@Public()` 装饰器标记不需要认证的接口
- JWT 策略中：
  - 开发环境：`ignoreExpiration: true`（Token 过期仍可使用）
  - 生产环境：`ignoreExpiration: false`（严格检查过期时间）

### 数据库操作

- 使用 Prisma ORM 进行数据库操作
- 所有数据库模型定义在 `prisma/schema.prisma` 中
- 使用 `PrismaService` 注入数据库客户端
- 执行迁移：`pnpm --filter keydo-server prisma:migrate`
- 生成 Prisma Client：`pnpm --filter keydo-server prisma:generate`

## 依赖管理

### 公共依赖（已在 monorepo 根目录）

- `zod`、`@yuan-shan/keydo-contract`
- **不要在 keyDoServer 中重复安装**

### 共享类型包（workspace 依赖）

- `@yuan-shan/keydo-contract`：前后端共享的类型定义和 Zod Schema
- 这是 monorepo 内的 workspace 依赖，通过 `workspace:*` 引用
- **所有 API 相关类型必须从此包导入，不要重复定义**

### keyDoServer 特有依赖

- NestJS 相关：`@nestjs/common`、`@nestjs/core`、`@nestjs/jwt`、`@nestjs/passport` 等
- Prisma：`@prisma/client`、`prisma`
- 认证：`passport`、`passport-jwt`、`bcryptjs`
- 安装命令：`pnpm --filter keydo-server add [package]`

## 开发工作流

### 启动开发服务器

```bash
# 在 monorepo 根目录
pnpm --filter keydo-server dev
```

### 数据库操作

```bash
# 启动数据库（在 server/keyDoServer 目录）
podman-compose up -d   # 或 docker-compose up -d

# 生成 Prisma Client（在 monorepo 根目录）
pnpm --filter keydo-server prisma:generate

# 数据库迁移（在 monorepo 根目录）
pnpm --filter keydo-server prisma:migrate

# 打开 Prisma Studio（在 monorepo 根目录）
pnpm --filter keydo-server prisma:studio
```
