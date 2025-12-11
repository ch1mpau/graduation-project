import { PageQueryDto, Paginate } from '@app/core';
import { ProjectStatusEnum } from '@app/core/constants/project.enum';
import { ProjectEntity } from '@app/core/entities/project.entity';
import { IsOptional, IsString } from 'class-validator';

export class ProjectDto {
  id: string;
  name: string;
  client: string;
  status: ProjectStatusEnum;
  owner: string;
  taskCount: number;
  constructor(project: ProjectEntity) {
    this.id = project.id;
    this.name = project.name;
    this.client = project.client;
    this.status = project.status;
    this.owner = project.owner_email;
    this.taskCount = +project.task_count;
  }
}

export enum SortField {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'created_at',
}

export class QueryProjectsDto extends PageQueryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  status: ProjectStatusEnum;
}

export class ProjectPaginatedDto extends Paginate(ProjectDto) {}
