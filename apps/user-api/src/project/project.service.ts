import {
  AppBadRequestException,
  ErrorCode,
  PageMetaDto,
  Role,
} from '@app/core';
import { StatusAccount } from '@app/core/constants/status-account';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { UserEntity } from '@app/core/entities/user.entity';
import {
  DetailProjectDto,
  ProjectDto,
  ProjectPaginatedDto,
  QueryProjectsDto,
} from './dto/project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectEntity } from '@app/core/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskEntity } from '@app/core/entities/task.entity';
import {
  GetTaskTypeEnum,
  QueryTasksDto,
  TaskDto,
  TaskPaginatedDto,
} from './dto/task.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ProjectStatusEnum,
  TaskStatusEnum,
} from '@app/core/constants/project.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DashboardDto, DashboardPercentageDto } from './dto/dashboard.dto';

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
    try {
      const { client, name, status, startAt, endAt } = body;
      const startAtTime = startAt ? new Date(startAt) : null;
      const endAtTime = endAt ? new Date(endAt) : null;
      if (startAtTime && endAtTime && startAtTime > endAtTime) {
        throw new AppBadRequestException(ErrorCode.START_END_TIME_ERROR);
      }
      const project = await this.projectsRepository.save(
        this.projectsRepository.create({
          client,
          name,
          status,
          owner_id: auth.id,
          start_at: startAtTime,
          end_at: endAtTime,
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
      'project.start_at as start_at',
      'project.end_at as end_at',
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
      if (startAtTime && endAtTime && startAtTime > endAtTime) {
        throw new AppBadRequestException(ErrorCode.START_END_TIME_ERROR);
      }
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

  async getTasks(query: QueryTasksDto): Promise<TaskPaginatedDto> {
    try {
      const { projectId, type, userId } = query;
      const whereOptions = {
        project_id: projectId,
        deleted_at: null,
      };
      if (type === GetTaskTypeEnum.SLOW_PROCESS) {
        whereOptions['end_at'] = LessThan(new Date());
      }
      if (userId) {
        whereOptions['assigned_to'] = userId;
      }
      const [tasks, total] = await this.tasksRepository.findAndCount({
        where: whereOptions,
        order: {
          created_at: 'ASC',
        },
        skip: query.skip,
        take: query.take,
      });
      const meta = new PageMetaDto({ options: query, total });
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
      const { projectId, name, status, client, startAt, endAt } = body;
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
      const startAtTime = startAt ? new Date(startAt) : null;
      const endAtTime = endAt ? new Date(endAt) : null;
      if (startAtTime !== undefined && startAtTime !== project.start_at) {
        project.start_at = startAtTime;
        needUpdate = true;
      }
      if (endAtTime !== undefined && endAtTime !== project.end_at) {
        project.end_at = endAtTime;
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
        if (status === TaskStatusEnum.COMPLETED) {
          task.completed_at = new Date();
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

  async getProjectById(projectId: string) {
    try {
      const project = await this.projectsRepository.findOne({
        where: {
          id: projectId,
          deleted_at: null,
        },
      });
      if (!project) {
        throw new AppBadRequestException(ErrorCode.PROJECT_NOT_FOUND);
      }
      const tasks = await this.tasksRepository.find({
        where: {
          project_id: projectId,
          deleted_at: null,
        },
        order: {
          created_at: 'DESC',
        },
      });
      project.task_count = tasks.length;
      const startedCount = tasks.filter(
        (task) => task.status === TaskStatusEnum.STARTED,
      ).length;
      const acceptedCount = tasks.filter(
        (task) => task.status === TaskStatusEnum.ACCEPTED,
      ).length;
      const inProgressCount = tasks.filter(
        (task) => task.status === TaskStatusEnum.IN_PROGRESS,
      ).length;
      const completedCount = tasks.filter(
        (task) => task.status === TaskStatusEnum.COMPLETED,
      ).length;
      return new DetailProjectDto(project, {
        startedCount,
        acceptedCount,
        inProgressCount,
        completedCount,
      });
    } catch (error) {
      Logger.error('Get project error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.GET_PROJECT_ERROR);
    }
  }

  async getTaskById(taskId: string) {
    try {
      const task = await this.tasksRepository.findOne({
        where: {
          id: taskId,
          deleted_at: null,
        },
      });
      if (!task) {
        throw new AppBadRequestException(ErrorCode.TASK_NOT_FOUND);
      }
      return new TaskDto(task);
    } catch (error) {
      Logger.error('Get task error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.GET_TASK_ERROR);
    }
  }

  async getDashboard(auth: UserEntity): Promise<DashboardDto> {
    try {
      const [projects, tasks, users] = await Promise.all([
        this.projectsRepository.find({
          where: {
            status: ProjectStatusEnum.IN_PROGRESS,
            deleted_at: null,
          },
        }),
        this.tasksRepository.find({
          where: {
            status: In([
              TaskStatusEnum.ACCEPTED,
              TaskStatusEnum.IN_PROGRESS,
              TaskStatusEnum.COMPLETED,
            ]),
            deleted_at: null,
          },
          order: {
            created_at: 'DESC',
          },
        }),
        this.usersRepository.find({
          where: {
            deleted_at: null,
            role: In([Role.Employee, Role.Director]),
            status: StatusAccount.ACTIVE,
          },
        }),
      ]);
      const openTasksCount = tasks.filter(
        (task) =>
          task.status === TaskStatusEnum.ACCEPTED ||
          task.status === TaskStatusEnum.IN_PROGRESS,
      ).length;
      const completeTasksCount = tasks.filter(
        (task) => task.status === TaskStatusEnum.COMPLETED,
      ).length;
      return {
        runningProjectsCount: projects.length,
        openTasksCount,
        completeTasksCount,
        usersCount: users.length,
      };
    } catch (error) {
      Logger.error('Get dashboard error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.GET_DASHBOARD_ERROR);
    }
  }

  async getDashboardPercentage(
    auth: UserEntity,
  ): Promise<DashboardPercentageDto> {
    try {
      const [completedTasks, startedTasksCount] = await Promise.all([
        this.tasksRepository.find({
          where: {
            status: TaskStatusEnum.COMPLETED,
            deleted_at: null,
          },
        }),
        this.tasksRepository.count({
          where: {
            status: TaskStatusEnum.STARTED,
            deleted_at: null,
          },
        }),
      ]);
      const rightProcessTasksCount = completedTasks.filter(
        (task) => task.completed_at <= task.end_at,
      ).length;
      const slowProcessTasksCount = completedTasks.filter(
        (task) => task.completed_at > task.end_at,
      ).length;
      return {
        rightProcessTasksCount,
        slowProcessTasksCount,
        startedTasksCount,
      };
    } catch (error) {
      Logger.error('Get dashboard error', error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
    }
  }
}
