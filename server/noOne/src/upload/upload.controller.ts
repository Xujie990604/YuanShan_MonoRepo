/**
 * @file upload.controller.ts
 * @description 文件上传控制器（头像）
 */

import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { UploadService } from './upload.service';
import { Public } from 'src/decorators/public.decorator';
import type { Request } from 'express';
import * as fs from 'fs';

function getAvatarUploadDir() {
  // 使用进程工作目录（一般就是项目根目录），避免依赖 __dirname 在 src/dist 下的层级
  return path.resolve(process.cwd(), 'uploads', 'avatar');
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) => {
        // 只允许常见图片
        const ok = /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);
        if (!ok) {
          return cb(new BadRequestException('只允许上传图片(jpeg/png/gif/webp)'), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
          const dir = getAvatarUploadDir();
          // multer 的 destination 目录必须存在，这里确保自动创建
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
          const ext = path.extname(file.originalname) || '';
          cb(null, `${Date.now()}-${randomUUID()}${ext}`);
        },
      }),
    }),
  )
  uploadAvatar(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未获取到上传文件');
    }
    const url = this.uploadService.buildAvatarUrl(file.filename);
    // 配合全局 ResponseInterceptor：最终返回 { data: { url }, code: 200, message: 'success' }
    return { url };
  }
}


