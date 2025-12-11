import { PageQueryDto, Paginate } from '@app/core';
import { TaskStatusEnum } from '@app/core/constants/project.enum';
import { TaskEntity } from '@app/core/entities/task.entity';
import { IsOptional, IsString } from 'class-validator';

export class TaskDto {
  id: string;
  name: string;
  status: TaskStatusEnum;
  ownerId: string;
  description: string;
  assignedTo: string;
  startAt: number;
  endAt: number;
  projectId: string;
  constructor(project: TaskEntity) {
    this.id = project.id;
    this.name = project.name;
    this.status = project.status;
    this.ownerId = project.user_id;
    this.description = project.description;
    this.assignedTo = project.assigned_to;
    this.projectId = project.project_id;
    this.startAt = project.start_at ? +project.start_at.getTime() : null;
    this.endAt = project.end_at ? project.end_at.getTime() : null;
  }
}

export class QueryTasksDto extends PageQueryDto {
  @IsString()
  @IsOptional()
  projectId: string;
}

export class TaskPaginatedDto extends Paginate(TaskDto) {}
