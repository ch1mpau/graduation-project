import { PageQueryDto, Paginate } from '@app/core';
import { TaskStatusEnum } from '@app/core/constants/project.enum';
import { TaskEntity } from '@app/core/entities/task.entity';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum GetTaskTypeEnum {
  SLOW_PROCESS = 'SLOW_PROCESS',
}

export class TaskDto {
  id: string;
  name: string;
  status: TaskStatusEnum;
  ownerId: string;
  description: string;
  priority: string;
  assignedTo: string;
  startAt: number;
  endAt: number;
  projectId: string;
  createdAt: number;
  completedAt: number;
  constructor(task: TaskEntity) {
    this.id = task.id;
    this.name = task.name;
    this.status = task.status;
    this.priority = task.priority;
    this.ownerId = task.user_id;
    this.description = task.description;
    this.assignedTo = task.assigned_to;
    this.projectId = task.project_id;
    this.startAt = task.start_at ? +task.start_at.getTime() : null;
    this.endAt = task.end_at ? task.end_at.getTime() : null;
    this.createdAt = task.created_at.getTime();
    this.completedAt = task.completed_at ? task.completed_at.getTime() : null;
  }
}

export class QueryTasksDto extends PageQueryDto {
  @IsString()
  @IsOptional()
  projectId: string;

  @IsEnum(GetTaskTypeEnum)
  @IsOptional()
  type: GetTaskTypeEnum;

  @IsString()
  @IsOptional()
  userId: string;
}

export class TaskPaginatedDto extends Paginate(TaskDto) {}
