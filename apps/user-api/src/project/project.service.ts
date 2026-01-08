import {
  AppBadRequestException,
  ErrorCode,
  PageMetaDto,
  Role,
} from '@app/core';
import { StatusAccount } from '@app/core/constants/status-account';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Not, Repository } from 'typeorm';
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
import { UploadProjectFilesDto } from './dto/upload-prj-file.dto';
import { FileEntity } from '@app/core/entities/image.entity';
import { UserTaskEntity } from '@app/core/entities/task-user.entity';
import { ProjectCustomerEntity } from '@app/core/entities/project-customer.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentEntity } from '@app/core/entities/comment.entity';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProjectEntity)
    private projectsRepository: Repository<ProjectEntity>,
    @InjectRepository(TaskEntity)
    private tasksRepository: Repository<TaskEntity>,
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
    @InjectRepository(UserTaskEntity)
    private userTaskRepository: Repository<UserTaskEntity>,
    @InjectRepository(ProjectCustomerEntity)
    private projectCustomerRepository: Repository<ProjectCustomerEntity>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async createProject(
    auth: UserEntity,
    body: CreateProjectDto,
  ): Promise<ProjectDto> {
    try {
      const { name, status, startAt, endAt } = body;
      const startAtTime = startAt ? new Date(startAt) : null;
      const endAtTime = endAt ? new Date(endAt) : null;
      if (startAtTime && endAtTime && startAtTime > endAtTime) {
        throw new AppBadRequestException(ErrorCode.START_END_TIME_ERROR);
      }
      const project = await this.projectsRepository.save(
        this.projectsRepository.create({
          name,
          status,
          owner_id: auth.id,
          start_at: startAtTime,
          end_at: endAtTime,
        }),
      );
      return new ProjectDto(project);
    } catch (error) {
      Logger.error('Create project error' + error);
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
    qb.leftJoinAndSelect('project.user', 'user');
    qb.leftJoinAndSelect('user.avatar', 'avatar');
    qb.leftJoin('project.tasks', 'task', 'task.project_id = project.id');
    qb.leftJoin('project.customers', 'customers');
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
      'project.id AS id',
      'project.name AS name',
      'project.status AS status',
      'project.created_at AS created_at',
      'project.start_at AS start_at',
      'project.end_at AS end_at',
      'COUNT(task.id) AS task_count',

      `json_build_object(
    'id', "user"."id",
    'email', "user"."email",
    'name', "user"."name",
    'avatar', avatar
  ) AS user`,
    ]);
    qb.groupBy('project.id, user.id, avatar.id');
    // sorting – 1 field only
    qb.orderBy(`project.created_at`, 'DESC');

    // pagination
    qb.limit(query.take);
    qb.offset((query.page - 1) * query.take);
    if (auth.role === Role.CUSTOMER) {
      const projectCustomers = await this.projectCustomerRepository.find({
        where: {
          user_id: auth.id,
          deleted_at: null,
        },
        select: ['project_id'],
      });
      const projectIds = projectCustomers.map((pc) => pc.project_id);

      if (projectIds.length > 0) {
        qb.andWhere('project.id IN (:...projectIds)', {
          projectIds,
        });
      } else {
        // user không thuộc project nào → trả empty
        qb.andWhere('1 = 0');
      }
    }
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
        startAt,
        endAt,
        priority,
        assignedUsers,
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
      if (project.status === ProjectStatusEnum.COMPLETED) {
        throw new AppBadRequestException(ErrorCode.TASK_COMPLETED);
      }
      let userIds = [];
      if (!!assignedUsers?.length) {
        const users = await this.usersRepository.find({
          where: {
            id: In(assignedUsers),
            deleted_at: null,
            status: StatusAccount.ACTIVE,
          },
        });
        userIds = users.map((user) => user.id);
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
          start_at: startAtTime,
          end_at: endAtTime,
          priority,
        }),
      );
      if (userIds.length > 0) {
        const userTasks = await Promise.all(
          userIds.map((userId) =>
            this.userTaskRepository.save(
              this.userTaskRepository.create({
                user_id: userId,
                task_id: task.id,
              }),
            ),
          ),
        );
        task.userTasks = await this.userTaskRepository.find({
          where: {
            task_id: task.id,
          },
          relations: ['user'],
        });
      }

      return new TaskDto(task);
    } catch (error) {
      Logger.error('Create task error' + error);
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
        whereOptions['status'] = Not(TaskStatusEnum.COMPLETED);
      }
      if (userId) {
        const userTasks = await this.userTaskRepository.find({
          where: {
            user_id: userId,
          },
        });
        whereOptions['id'] = In(userTasks.map((userTask) => userTask.task_id));
        whereOptions['status'] = Not(TaskStatusEnum.COMPLETED);
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
      Logger.error('Get tasks error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.GET_TASK_ERROR);
    }
  }

  async deleteProject(auth: UserEntity, id: string): Promise<any> {
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
      Logger.error('Delete project error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.DELETE_PROJECT_ERROR);
    }
  }

  async deleteTask(auth: UserEntity, id: string): Promise<any> {
    try {
      const task = await this.tasksRepository.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });
      if (!task) {
        throw new AppBadRequestException(ErrorCode.TASK_NOT_FOUND);
      }
      await this.tasksRepository.softDelete(id);
      return;
    } catch (error) {
      Logger.error('Delete task error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.DELETE_TASK_ERROR);
    }
  }

  async updateProject(
    auth: UserEntity,
    body: UpdateProjectDto,
  ): Promise<ProjectDto> {
    try {
      const { projectId, name, status, startAt, endAt, customers } = body;
      const project = await this.projectsRepository.findOne({
        where: {
          id: projectId,
          deleted_at: null,
        },
        relations: {
          customers: {
            user: true,
          },
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
      let updateTaskCompleted = false;
      if (status !== undefined && status !== project.status) {
        if (project.status === ProjectStatusEnum.COMPLETED) {
          throw new AppBadRequestException(ErrorCode.PROJECT_COMPLETED);
        }
        if (status === ProjectStatusEnum.COMPLETED) {
          updateTaskCompleted = true;
        }
        project.status = status;
        needUpdate = true;
      }
      const startAtTime = startAt ? new Date(startAt) : undefined;
      const endAtTime = endAt ? new Date(endAt) : undefined;
      if (startAtTime !== undefined && startAtTime !== project.start_at) {
        project.start_at = startAtTime;
        needUpdate = true;
      }
      if (endAtTime !== undefined && endAtTime !== project.end_at) {
        project.end_at = endAtTime;
        needUpdate = true;
      }
      if (Array.isArray(customers)) {
        const existedCustomerIds = project.customers.map((c) => c.user_id);

        const toCreate = customers.filter(
          (id) => !existedCustomerIds.includes(id),
        );

        const toDelete = existedCustomerIds.filter(
          (id) => !customers.includes(id),
        );

        if (toCreate.length > 0) {
          const newCustomers = toCreate.map((userId) =>
            this.projectCustomerRepository.create({
              project_id: projectId,
              user_id: userId,
            }),
          );
          const created =
            await this.projectCustomerRepository.save(newCustomers);
          project.customers = [...project.customers, ...created];
        }

        if (toDelete.length > 0) {
          const deleted = await this.projectCustomerRepository.softDelete({
            project_id: project.id,
            user_id: In(toDelete),
          });
          project.customers = project.customers.filter(
            (c) => !toDelete.includes(c.user_id),
          );
        }
        needUpdate = true;
      }

      if (needUpdate) {
        await this.projectsRepository.save(project);
        if (!!updateTaskCompleted) {
          await this.tasksRepository.update(
            { project_id: projectId },
            {
              status: TaskStatusEnum.COMPLETED as any,
              completed_at: () => 'NOW()',
            },
          );
        }
      }
      if (!!project.customers && project.customers.length > 0) {
        const customers = await this.projectCustomerRepository.find({
          where: {
            project_id: project.id,
            deleted_at: null,
          },
          relations: {
            user: {
              avatar: true,
            },
          },
        });
        project.customers = customers;
      }
      return new ProjectDto(project);
    } catch (error) {
      Logger.error('Update project error' + error);
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
        assignedUsers,
        startAt,
        endAt,
      } = body;
      const task = await this.tasksRepository.findOne({
        where: {
          id: taskId,
          deleted_at: null,
        },
        relations: ['userTasks'],
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

      if (Array.isArray(assignedUsers)) {
        const existedUserIds = task.userTasks.map((ut) => ut.user_id);

        const toCreate = assignedUsers.filter(
          (id) => !existedUserIds.includes(id),
        );

        const toDelete = existedUserIds.filter(
          (id) => !assignedUsers.includes(id),
        );

        if (toCreate.length > 0) {
          const newUserTasks = toCreate.map((userId) =>
            this.userTaskRepository.create({
              task_id: task.id,
              user_id: userId,
            }),
          );

          const savedUserTasks =
            await this.userTaskRepository.save(newUserTasks);
          task.userTasks.push(...savedUserTasks);
        }

        if (toDelete.length > 0) {
          await this.userTaskRepository.softDelete({
            task_id: task.id,
            user_id: In(toDelete),
          });

          task.userTasks = task.userTasks.filter(
            (ut) => !toDelete.includes(ut.user_id),
          );
        }
        needUpdate = true;
      }

      if (name !== undefined && name !== task.name) {
        task.name = name;
        needUpdate = true;
      }
      if (description !== undefined && description !== task.description) {
        task.description = description;
        needUpdate = true;
      }

      if (priority !== undefined && priority !== task.priority) {
        task.priority = priority;
        needUpdate = true;
      }
      const startAtTime = startAt ? new Date(startAt) : undefined;
      const endAtTime = endAt ? new Date(endAt) : undefined;
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
      if (!!task.userTasks && task.userTasks.length > 0) {
        const userTasks = await this.userTaskRepository.find({
          where: {
            task_id: task.id,
            deleted_at: null,
          },
          relations: ['user'],
        });
        task.userTasks = userTasks;
      }
      return new TaskDto(task);
    } catch (error) {
      Logger.error('Update task error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      } else {
        throw new AppBadRequestException(ErrorCode.UPDATE_TASK_ERROR);
      }
    }
  }

  async getProjectById(projectId: string) {
    try {
      const project = await this.projectsRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user', 'user')
        .leftJoinAndSelect('user.avatar', 'avatar')
        .leftJoinAndSelect('project.customers', 'customers')
        .leftJoinAndSelect('customers.user', 'customersUser')
        .leftJoinAndSelect('customersUser.avatar', 'customersAvatar')
        .where('project.id = :projectId', { projectId })
        .andWhere('project.deleted_at IS NULL')
        .getOne();
      console.log(44444, project);

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
      Logger.error('Get project error' + error);
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
        relations: {
          userTasks: {
            user: true,
          },
          comments: {
            user: {
              avatar: true,
            },
            files: true,
          },
        },
      });
      if (!task) {
        throw new AppBadRequestException(ErrorCode.TASK_NOT_FOUND);
      }
      const files = await this.filesRepository.find({
        where: {
          task_id: taskId,
          deleted_at: null,
        },
      });
      return new TaskDto(task, files);
    } catch (error) {
      Logger.error('Get task error' + error);
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
      Logger.error('Get dashboard error' + error);
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
      Logger.error('Get dashboard error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
    }
  }

  async uploadProjectFiles(
    auth: UserEntity,
    body: UploadProjectFilesDto,
  ): Promise<any> {
    try {
      const { projectId, taskId, fileIds } = body;
      const files = await this.filesRepository.find({
        where: {
          id: In(fileIds),
          deleted_at: null,
        },
      });
      if (!files || !files.length) {
        throw new AppBadRequestException(ErrorCode.FILE_NOT_FOUND);
      }
      if (!!taskId) {
        const task = await this.tasksRepository.findOne({
          where: {
            id: taskId,
            deleted_at: null,
          },
        });
        if (!task) {
          throw new AppBadRequestException(ErrorCode.TASK_NOT_FOUND);
        }
      }
      if (!!projectId) {
        const project = await this.projectsRepository.findOne({
          where: {
            id: projectId,
            deleted_at: null,
          },
        });
        if (!project) {
          throw new AppBadRequestException(ErrorCode.PROJECT_NOT_FOUND);
        }
      }
      await Promise.all(
        files.map((file) => {
          file.task_id = taskId;
          file.project_id = projectId;
          return this.filesRepository.save(file);
        }),
      );
    } catch (error) {
      Logger.error('Upload project files error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.UPLOAD_PROJECT_FILES_ERROR);
    }
  }

  async createComment(auth: UserEntity, body: CreateCommentDto) {
    try {
      const { taskId, content, fileIds } = body;
      const task = await this.tasksRepository.findOne({
        where: {
          id: taskId,
          deleted_at: null,
        },
      });
      if (!task) {
        throw new AppBadRequestException(ErrorCode.TASK_NOT_FOUND);
      }
      if (task.status === TaskStatusEnum.COMPLETED) {
        throw new AppBadRequestException(ErrorCode.TASK_COMPLETED);
      }
      const comment = await this.commentRepository.save(
        this.commentRepository.create({
          task_id: taskId,
          user_id: auth.id,
          content,
        }),
      );
      if (!!Array.isArray(fileIds) && fileIds.length > 0) {
        await this.filesRepository.update(
          {
            id: In(fileIds),
          },
          {
            comment_id: comment.id as any,
          },
        );
      }
      const createdComment = await this.commentRepository.findOne({
        where: {
          id: comment.id,
          deleted_at: null,
        },
        relations: {
          user: {
            avatar: true,
          },
          files: true,
        },
      });
      return new CommentDto(createdComment);
    } catch (error) {
      Logger.error('Create comment error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.CREATE_COMMENT_ERROR);
    }
  }

  async getComments(auth: UserEntity, taskId: string) {
    try {
      const comments = await this.commentRepository.find({
        where: {
          task_id: taskId,
          deleted_at: null,
        },
        relations: {
          user: {
            avatar: true,
          },
          files: true,
        },
        order: {
          created_at: 'DESC',
        },
      });
      return comments.map((comment) => new CommentDto(comment));
    } catch (error) {
      Logger.error('Get comments error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
    }
  }
}
