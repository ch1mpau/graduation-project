import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
}
