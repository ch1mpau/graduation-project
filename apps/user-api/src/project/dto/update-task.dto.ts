import {
  TaskPriorityEnum,
  TaskStatusEnum,
} from '@app/core/constants/project.enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(TaskPriorityEnum)
  @IsOptional()
  priority: TaskPriorityEnum;

  @IsEnum(TaskStatusEnum)
  @IsOptional()
  status: TaskStatusEnum = TaskStatusEnum.STARTED;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedUsers: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startAt?: number | null; // Timestamp in millis

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endAt?: number | null; // Timestamp in millis
}
