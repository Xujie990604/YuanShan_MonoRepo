/**
 * @file upload.service.ts
 * @description 上传服务（目前仅处理头像上传的 URL 拼接）
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  buildAvatarUrl(filename: string) {
    // 返回相对路径，前端可拼接域名；也方便后续切换到 OSS
    return `/static/avatar/${filename}`;
  }
}


