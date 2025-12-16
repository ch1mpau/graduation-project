import { PageQueryDto, Paginate } from '@app/core';
import { ProjectStatusEnum } from '@app/core/constants/project.enum';
import { ProjectEntity } from '@app/core/entities/project.entity';
import { IsOptional, IsString } from 'class-validator';

export class DashboardDto {
  runningProjectsCount: number;
  openTasksCount: number;
  completeTasksCount: number;
  usersCount: number;
}

export class DashboardPercentageDto {
  rightProcessTasksCount: number;
  slowProcessTasksCount: number;
  startedTasksCount: number;
}
