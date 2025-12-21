import { PageQueryDto, Paginate } from '@app/core';
import { TaskStatusEnum } from '@app/core/constants/project.enum';
import { FileEntity } from '@app/core/entities/image.entity';
import { TaskEntity } from '@app/core/entities/task.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FileDto } from '../../file/dto/file.dto';
import { UserDto } from '../../user/dto/user.dto';
import { CommentDto } from './comment.dto';

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
  assignedUsers: UserDto[];
  startAt: number;
  endAt: number;
  projectId: string;
  createdAt: number;
  completedAt: number;
  files?: FileDto[];
  comments?: CommentDto[];

  constructor(task: TaskEntity, files?: FileEntity[]) {
    this.id = task.id;
    this.name = task.name;
    this.status = task.status;
    this.priority = task.priority;
    this.ownerId = task.user_id;
    this.description = task.description;
    this.projectId = task.project_id;
    this.startAt = task.start_at ? +task.start_at.getTime() : null;
    this.endAt = task.end_at ? task.end_at.getTime() : null;
    this.createdAt = task.created_at.getTime();
    this.completedAt = task.completed_at ? task.completed_at.getTime() : null;
    this.assignedUsers = !!task.userTasks
      ? task.userTasks.map((userTask) => new UserDto(userTask.user))
      : [];
    this.files = files && files.map((file) => new FileDto(file));
    this.comments = Array.isArray(task.comments)
      ? task.comments
          .map((comment) => new CommentDto(comment))
          .sort((a, b) => a.createdAt - b.createdAt)
      : [];
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
