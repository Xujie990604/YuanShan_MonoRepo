# KeyDo Contract

前后端共享的类型定义和验证 Schema 包。

## 功能

- 使用 TypeScript 定义类型
- 使用 Zod 进行数据验证
- 前后端共享类型，保证类型安全

## 使用

### 安装依赖

在 monorepo 根目录运行：

```bash
pnpm install
```

### 导入类型和 Schema

```typescript
// 导入类型
import { SigninInput, SignupInput, SigninResponse, SignupResponse } from '@yuan-shan/keydo-contract';

// 导入 Zod Schema（用于验证）
import { signinSchema, signupSchema } from '@yuan-shan/keydo-contract';
```

## 后端使用（NestJS）

使用 `ZodValidationPipe` 进行验证：

```typescript
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { signinSchema, SigninInput } from '@yuan-shan/keydo-contract';

@Post('signin')
@UsePipes(new ZodValidationPipe(signinSchema))
async signin(@Body() signinDto: SigninInput) {
  // ...
}
```

## 前端使用

可以直接使用类型进行类型检查：

```typescript
import { SigninInput, SigninResponse } from '@yuan-shan/keydo-contract';

// 使用类型
const loginData: SigninInput = {
  username: 'test',
  password: '123456',
};

// 使用 Schema 进行验证（前端也可以使用 zod 验证）
import { signinSchema } from '@yuan-shan/keydo-contract';
const result = signinSchema.safeParse(loginData);
```

