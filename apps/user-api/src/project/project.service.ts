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
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskEntity } from '@app/core/entities/task.entity';
import { QueryTasksDto, TaskDto, TaskPaginatedDto } from './dto/task.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ProjectStatusEnum,
  TaskStatusEnum,
} from '@app/core/constants/project.enum';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProjectEntity)
    private projectsRepository: Repository<ProjectEntity>,
    @InjectRepository(TaskEntity)
    private tasksRepository: Repository<TaskEntity>,
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
    if (query.status) {
      qb.andWhere('project.status = :status', { status: query.status });
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
    qb.limit(query.take);
    qb.offset((query.page - 1) * query.take);

    const projects = await qb.getRawMany();
    const total = await qb.getCount();

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

  async createTask(auth: UserEntity, body: CreateTaskDto) {
    try {
      const {
        projectId,
        name,
        status,
        description,
        assignedTo,
        startAt,
        endAt,
      } = body;
      const project = await this.projectsRepository.findOne({
        where: {
          id: projectId,
          deleted_at: null,
        },
      });
      if (!project) {
        throw new AppBadRequestException(ErrorCode.PROJECT_NOT_FOUND);
      }
      let assignedUserId = assignedTo;
      if (!!assignedTo) {
        const assignedUser = await this.usersRepository.findOne({
          where: {
            id: assignedTo,
            deleted_at: null,
            status: StatusAccount.ACTIVE,
          },
        });
        if (!assignedUser) {
          assignedUserId = null;
        }
      }
      const startAtTime = startAt ? new Date(startAt) : null;
      const endAtTime = endAt ? new Date(endAt) : null;
      const task = await this.tasksRepository.save(
        this.tasksRepository.create({
          project_id: projectId,
          name,
          status,
          owner_id: auth.id,
          description,
          assigned_to: assignedUserId,
          start_at: startAtTime,
          end_at: endAtTime,
        }),
      );
      return new TaskDto(task);
    } catch (error) {
      Logger.error('Create task error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.CREATE_TASK_ERROR);
    }
  }

  async getTasks(
    auth: UserEntity,
    body: QueryTasksDto,
  ): Promise<TaskPaginatedDto> {
    try {
      const { projectId } = body;
      const [tasks, total] = await this.tasksRepository.findAndCount({
        where: {
          project_id: projectId,
          deleted_at: null,
        },
        order: {
          created_at: 'ASC',
        },
        skip: body.skip,
        take: body.take,
      });
      const meta = new PageMetaDto({ options: body, total });
      return new TaskPaginatedDto(
        tasks.map((task) => new TaskDto(task)),
        meta,
      );
    } catch (error) {
      Logger.error('Get tasks error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.GET_TASK_ERROR);
    }
  }

  async deleteProject(
    auth: UserEntity,
    id: string,
  ): Promise<ProjectPaginatedDto> {
    try {
      const project = await this.projectsRepository.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });
      if (!project) {
        throw new AppBadRequestException(ErrorCode.PROJECT_NOT_FOUND);
      }
      await this.projectsRepository.softDelete(id);
      await this.tasksRepository.softDelete({ project_id: id });
      return;
    } catch (error) {
      Logger.error('Delete project error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.DELETE_PROJECT_ERROR);
    }
  }

  async updateProject(
    auth: UserEntity,
    body: UpdateProjectDto,
  ): Promise<ProjectDto> {
    try {
      const { projectId, name, status, client } = body;
      const project = await this.projectsRepository.findOne({
        where: {
          id: projectId,
          deleted_at: null,
        },
      });
      if (!project) {
        throw new AppBadRequestException(ErrorCode.PROJECT_NOT_FOUND);
      }
      let needUpdate = false;
      if (name !== undefined && name !== project.name) {
        project.name = name;
        needUpdate = true;
      }
      if (status !== undefined && status !== project.status) {
        if (project.status === ProjectStatusEnum.COMPLETED) {
          throw new AppBadRequestException(ErrorCode.PROJECT_COMPLETED);
        }
        project.status = status;
        needUpdate = true;
      }
      if (client !== undefined && client !== project.client) {
        project.client = client;
        needUpdate = true;
      }
      if (needUpdate) {
        await this.projectsRepository.save(project);
      }
      return new ProjectDto(project);
    } catch (error) {
      Logger.error('Update project error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      } else {
        throw new AppBadRequestException(ErrorCode.UPDATE_PROJECT_ERROR);
      }
    }
  }

  async updateTask(auth: UserEntity, body: UpdateTaskDto): Promise<TaskDto> {
    try {
      const {
        taskId,
        name,
        priority,
        status,
        description,
        assignedTo,
        startAt,
        endAt,
      } = body;
      const task = await this.tasksRepository.findOne({
        where: {
          id: taskId,
          deleted_at: null,
        },
      });
      if (!task) {
        throw new AppBadRequestException(ErrorCode.TASK_NOT_FOUND);
      }
      let needUpdate = false;
      if (status !== undefined && status !== task.status) {
        if (task.status === TaskStatusEnum.COMPLETED) {
          throw new AppBadRequestException(ErrorCode.TASK_COMPLETED);
        }
        task.status = status;
        needUpdate = true;
      }
      let assignedUserId = assignedTo;
      if (!!assignedTo && assignedTo !== task.assigned_to) {
        const assignedUser = await this.usersRepository.findOne({
          where: {
            id: assignedTo,
            deleted_at: null,
            status: StatusAccount.ACTIVE,
          },
        });
        if (!assignedUser) {
          throw new AppBadRequestException(ErrorCode.USER_NOT_FOUND);
        }
        assignedUserId = assignedUser.id;
      }
      if (name !== undefined && name !== task.name) {
        task.name = name;
        needUpdate = true;
      }
      if (description !== undefined && description !== task.description) {
        task.description = description;
        needUpdate = true;
      }
      if (assignedUserId !== undefined && assignedUserId !== task.assigned_to) {
        task.assigned_to = assignedUserId;
        needUpdate = true;
      }
      if (priority !== undefined && priority !== task.priority) {
        task.priority = priority;
        needUpdate = true;
      }
      const startAtTime = startAt ? new Date(startAt) : null;
      const endAtTime = endAt ? new Date(endAt) : null;
      if (startAtTime !== undefined && startAtTime !== task.start_at) {
        task.start_at = startAtTime;
        needUpdate = true;
      }
      if (endAtTime !== undefined && endAtTime !== task.end_at) {
        task.end_at = endAtTime;
        needUpdate = true;
      }
      if (needUpdate) {
        await this.tasksRepository.save(task);
      }
      return new TaskDto(task);
    } catch (error) {
      Logger.error('Update task error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      } else {
        throw new AppBadRequestException(ErrorCode.UPDATE_TASK_ERROR);
      }
    }
  }
}
