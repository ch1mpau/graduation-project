import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/core/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FileEntity } from '@app/core/entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FileEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
