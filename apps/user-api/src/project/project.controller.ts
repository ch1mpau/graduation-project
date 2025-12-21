import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransformResponseInterceptor } from '@app/core/interceptors/transform-response.interceptor';
import { UserEntity } from '@app/core/entities/user.entity';
import { JwtAuthGuard } from '../auth/gaurds/jwt.guard';
import { AuthUser } from '@app/core/decorators/auth-user.decorator';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import {
  ProjectDto,
  ProjectPaginatedDto,
  QueryProjectsDto,
} from './dto/project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto, TaskDto, TaskPaginatedDto } from './dto/task.dto';
import { RequireDirector, RequireEmployee } from '@app/core';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DashboardDto, DashboardPercentageDto } from './dto/dashboard.dto';
import { UploadProjectFilesDto } from './dto/upload-prj-file.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Project')
@Controller({
  path: 'project',
  version: '1',
})
@UseInterceptors(TransformResponseInterceptor)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async create(
    @AuthUser() auth: UserEntity,
    @Body() body: CreateProjectDto,
  ): Promise<ProjectDto> {
    return await this.projectService.createProject(auth, body);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProjects(
    @AuthUser() auth: UserEntity,
    @Query() query: QueryProjectsDto,
  ): Promise<ProjectPaginatedDto> {
    return await this.projectService.getProjects(auth, query);
  }

  @Get('detail/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDetailProject(@Param('id') id: string): Promise<ProjectDto> {
    return await this.projectService.getProjectById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireDirector()
  @HttpCode(HttpStatus.OK)
  async deleteProject(
    @AuthUser() auth: UserEntity,
    @Param('id') id: string,
  ): Promise<ProjectPaginatedDto> {
    return await this.projectService.deleteProject(auth, id);
  }

  @Put('')
  @UseGuards(JwtAuthGuard)
  @RequireDirector()
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @AuthUser() auth: UserEntity,
    @Body() body: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return await this.projectService.updateProject(auth, body);
  }

  @Post('task')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createTask(
    @AuthUser() auth: UserEntity,
    @Body() body: CreateTaskDto,
  ): Promise<TaskDto> {
    return await this.projectService.createTask(auth, body);
  }

  @Get('task')
  @HttpCode(HttpStatus.OK)
  async getTasks(@Query() query: QueryTasksDto): Promise<TaskPaginatedDto> {
    return await this.projectService.getTasks(query);
  }

  @Get('task/detail/:id')
  @HttpCode(HttpStatus.OK)
  async getDetailTask(@Param('id') id: string): Promise<TaskDto> {
    return await this.projectService.getTaskById(id);
  }

  @Put('task')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @AuthUser() auth: UserEntity,
    @Body() body: UpdateTaskDto,
  ): Promise<TaskDto> {
    return await this.projectService.updateTask(auth, body);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDashboard(@AuthUser() auth: UserEntity): Promise<DashboardDto> {
    return await this.projectService.getDashboard(auth);
  }

  @Get('dashboard/percentage')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDashboardPercentage(
    @AuthUser() auth: UserEntity,
  ): Promise<DashboardPercentageDto> {
    return await this.projectService.getDashboardPercentage(auth);
  }

  @Post('files')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async uploadFileProject(
    @AuthUser() auth: UserEntity,
    @Body() body: UploadProjectFilesDto,
  ): Promise<any> {
    return await this.projectService.uploadProjectFiles(auth, body);
  }

  @Post('task/comment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createComment(
    @AuthUser() auth: UserEntity,
    @Body() body: CreateCommentDto,
  ): Promise<any> {
    return await this.projectService.createComment(auth, body);
  }

  
  @Get('task/comment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getComment(
    @AuthUser() auth: UserEntity,
    @Query('taskId') query:string,
  ): Promise<any> {
    return await this.projectService.getComments(auth, query);
  }
}
