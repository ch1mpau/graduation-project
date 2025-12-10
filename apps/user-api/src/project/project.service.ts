import { AppBadRequestException, ErrorCode, PageMetaDto } from '@app/core';
import { StatusAccount } from '@app/core/constants/status-account';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/core/entities/user.entity';
import {
  ProjectDto,
  ProjectPaginatedDto,
  QueryProjectsDto,
} from './dto/project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectEntity } from '@app/core/entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProjectEntity)
    private projectsRepository: Repository<ProjectEntity>,
  ) {}

  async createProject(
    auth: UserEntity,
    body: CreateProjectDto,
  ): Promise<ProjectDto> {
    console.log(33333, auth);

    try {
      const { client, name, status } = body;
      const project = await this.projectsRepository.save(
        this.projectsRepository.create({
          client,
          name,
          status,
          owner_id: auth.id,
        }),
      );
      return new ProjectDto(project);
    } catch (error) {
      Logger.error('Create project error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.CREATE_PROJECT_ERROR);
    }
  }

  async getProjects(
    auth: UserEntity,
    query: QueryProjectsDto,
  ): Promise<ProjectPaginatedDto> {
    const qb = this.projectsRepository.createQueryBuilder('project');
    qb.leftJoinAndSelect('project.user', 'owner');
    qb.leftJoin('project.tasks', 'task', 'task.project_id = project.id');

    // basic constraints
    qb.where('project.deleted_at IS NULL');

    // optional filters
    if (query.name) {
      qb.andWhere('project.name ILIKE :name', { name: `%${query.name}%` });
    }
    qb.select([
      'project.id as id',
      'project.name as name',
      'project.client as client',
      'project.status as status',
      'project.created_at as created_at',
      'owner.email AS owner_email',
      'COUNT(task.id) AS task_count',
    ]);
    qb.groupBy('project.id, owner.email');
    // sorting – 1 field only
    qb.orderBy(`project.created_at`, 'DESC');

    // pagination
    qb.skip(query.skip).take(query.take);

    const projects = await qb.getRawMany();
    const total = await qb.getCount();
    console.log(22222, projects);

    // map to DTOs
    if (!projects) {
      return new ProjectPaginatedDto(
        [],
        new PageMetaDto({ options: query, total: 0 }),
      );
    }
    const meta = new PageMetaDto({ options: query, total });

    return new ProjectPaginatedDto(
      projects.map((project) => new ProjectDto(project)),
      meta,
    );
  }
}
