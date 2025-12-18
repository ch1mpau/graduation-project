import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/core/entities/user.entity';
import { ProjectEntity } from '@app/core/entities/project.entity';
import { TaskEntity } from '@app/core/entities/task.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { FileEntity } from '@app/core/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ProjectEntity,
      TaskEntity,
      FileEntity,
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
