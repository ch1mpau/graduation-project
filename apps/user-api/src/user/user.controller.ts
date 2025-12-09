import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransformResponseInterceptor } from '@app/core/interceptors/transform-response.interceptor';
import { UserService } from './user.service';
import { UserEntity } from '@app/core/entities/user.entity';
import { JwtAuthGuard } from '../auth/gaurds/jwt.guard';
import { AuthUser } from '@app/core/decorators/auth-user.decorator';
import { QueryEmployeesDto } from './dto/user.dto';

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
@UseInterceptors(TransformResponseInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('employees')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async create(
    @AuthUser() auth: UserEntity,
    @Query() query: QueryEmployeesDto,
  ): Promise<any> {
    return await this.userService.getEmployees(auth, query);
  }
}
