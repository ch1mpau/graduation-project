import { PageQueryDto, Paginate } from '@app/core';
import { ProjectStatusEnum } from '@app/core/constants/project.enum';
import { ProjectEntity } from '@app/core/entities/project.entity';
import { IsOptional, IsString } from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';

export class ProjectDto {
  id: string;
  name: string;
  status: ProjectStatusEnum;
  ownerId: string;
  taskCount: number;
  createdAt: number;
  startAt: number;
  endAt: number;
  owner: UserDto | null;
  customers: UserDto[];
  constructor(project: ProjectEntity) {
    this.id = project.id;
    this.name = project.name;
    this.status = project.status;
    this.ownerId = project.owner_id;
    this.taskCount = +project.task_count;
    this.owner = project?.user ? new UserDto(project.user) : null;
    this.createdAt = project.created_at ? project.created_at.getTime() : null;
    this.startAt = project.start_at ? project.start_at.getTime() : null;
    this.endAt = project.end_at ? project.end_at.getTime() : null;
    this.customers = !!project.customers
      ? project.customers.map((customer) => new UserDto(customer.user))
      : [];
  }
}

export class DetailProjectDto extends ProjectDto {
  startedCount: number;
  acceptedCount: number;
  inProgressCount: number;
  completedCount: number;
  constructor(project: ProjectEntity, statusTaskCount?: any) {
    super(project);
    this.startedCount = statusTaskCount?.startedCount || 0;
    this.acceptedCount = statusTaskCount?.acceptedCount || 0;
    this.inProgressCount = statusTaskCount?.inProgressCount || 0;
    this.completedCount = statusTaskCount?.completedCount || 0;
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
