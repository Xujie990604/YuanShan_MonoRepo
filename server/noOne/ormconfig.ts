import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { ConfigEnum } from './src/enum/config.enum';

// 通过环境变量读取不同的.env文件
export function getEnv(env: string): Record<string, unknown> {
  if (fs.existsSync(env)) {
    return dotenv.parse(fs.readFileSync(env));
  }
  return {};
}

// 通过 dotENV 来解析不同的配置
export function buildConnectionOptions() {
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'development'}`);
  const config = { ...defaultConfig, ...envConfig };

  const logFlag = config['LOG_ON'] === 'true';

  const entitiesDir =
    process.env.NODE_ENV === 'test'
      ? [__dirname + '/**/*.entity.ts']
      : [__dirname + '/**/*.entity{.js,.ts}'];

  return {
    type: config[ConfigEnum.DATABASE_TYPE],
    host: config[ConfigEnum.DATABASE_HOST],
    port: config[ConfigEnum.DATABASE_PORT],
    username: config[ConfigEnum.DATABASE_USER],
    password: config[ConfigEnum.DATABASE_PASSWORD],
    database: config[ConfigEnum.DATABASE_NAME],
    entities: entitiesDir,
    // 同步本地的 schema 与数据库 -> 初始化的时候去使用
    synchronize: true,
    logging: logFlag && process.env.NODE_ENV === 'development',
  } as TypeOrmModuleOptions;
}

export const connectionParams = buildConnectionOptions();

export default new DataSource({
  ...connectionParams,
  migrations: ['src/migrations/**'],
  subscribers: [],
} as DataSourceOptions);
