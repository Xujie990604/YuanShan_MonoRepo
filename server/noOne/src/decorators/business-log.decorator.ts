import { SetMetadata } from '@nestjs/common';

/**
 * 业务日志装饰器
 * 用于标记需要记录业务日志的方法
 * 
 * @param description 日志描述（可选），用于标识该操作的业务含义
 * @example
 * ```typescript
 * @BusinessLog('查询用户列表')
 * @Get()
 * getAllUsers() {
 *   // ...
 * }
 * ```
 */
export const BUSINESS_LOG_KEY = 'business_log';

export const BusinessLog = (description?: string) => 
  SetMetadata(BUSINESS_LOG_KEY, { enabled: true, description });

