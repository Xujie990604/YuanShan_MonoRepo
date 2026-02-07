import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  completeTaskSchema,
  CreateTaskInput,
  UpdateTaskInput,
  CompleteTaskInput,
  Task,
} from '@yuan-shan/keydo-contract';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * 获取当前用户的所有任务
   */
  @Get()
  async findAll(@Req() req): Promise<Task[]> {
    return this.taskService.findAll(req.user.userId);
  }

  /**
   * 创建任务
   */
  @Post()
  async create(
    @Req() req,
    @Body(new ZodValidationPipe(createTaskSchema)) createTaskInput: CreateTaskInput,
  ): Promise<Task> {
    return this.taskService.create(req.user.userId, createTaskInput);
  }

  /**
   * 更新任务
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateTaskSchema)) updateTaskInput: UpdateTaskInput,
  ): Promise<Task> {
    return this.taskService.update(id, req.user.userId, updateTaskInput);
  }

  /**
   * 删除任务
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req): Promise<{ success: boolean }> {
    await this.taskService.remove(id, req.user.userId);
    return { success: true };
  }

  /**
   * 设置任务完成状态（支持重复任务自动生成下一实例）
   */
  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(completeTaskSchema)) completeTaskInput: CompleteTaskInput,
  ): Promise<Task> {
    return this.taskService.complete(id, req.user.userId, completeTaskInput);
  }
}
