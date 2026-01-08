import {
  AppBadRequestException,
  ErrorCode,
  PageMetaDto,
  Role,
} from '@app/core';
import { StatusAccount } from '@app/core/constants/status-account';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/core/entities/user.entity';
import { QueryEmployeesDto, UserDto, UserPaginatedDto } from './dto/user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { FileEntity } from '@app/core/entities/image.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
  ) {}

  async getEmployees(
    auth: UserEntity,
    query: QueryEmployeesDto,
  ): Promise<UserPaginatedDto> {
    try {
      const qb = this.usersRepository.createQueryBuilder('user');
      console.log(4444, query);

      // basic constraints
      qb.where('user.status = :status', {
        status: StatusAccount.ACTIVE,
      }).andWhere('user.deleted_at IS NULL');

      // optional filters
      if (query.name) {
        qb.andWhere('user.name ILIKE :name', { name: `%${query.name}%` });
      }
      if (query.email) {
        qb.andWhere('user.email ILIKE :email', { email: `%${query.email}%` });
      }
      if (query.phoneNumber) {
        qb.andWhere('user.phone_number ILIKE :phone_number', {
          phone_number: `%${query.phoneNumber}%`,
        });
      }
      if (query.role) {
        if (query.role === Role.Employee) {
          qb.andWhere('user.role IN (:...roles)', {
            roles: [Role.Employee, Role.Director],
          });
        } else {
          qb.andWhere('user.role = :qRole', { qRole: query.role });
        }
      }

      // sorting – 1 field only
      qb.orderBy(`user.${query.sort}`, query.order);

      // pagination
      qb.skip(query.skip).take(query.take);

      // ---------------------------------------------------------------
      const users = await qb.getMany();
      const total = await qb.getCount();
      // map to DTOs
      const meta = new PageMetaDto({ options: query, total });
      return new UserPaginatedDto(
        users.map((u: UserEntity) => new UserDto(u)),
        meta,
      );
    } catch (error) {
      Logger.error('Get employees error' + error);
      throw new AppBadRequestException(ErrorCode.GET_EMPLOYEES_ERROR);
    }
  }

  async getMe(auth: UserEntity): Promise<UserDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: auth.id, deleted_at: null, status: StatusAccount.ACTIVE },
      });
      if (!user) {
        throw new AppBadRequestException(ErrorCode.USER_NOT_FOUND);
      }
      if (!!user?.avatar_id) {
        const avatar = await this.filesRepository.findOne({
          where: {
            id: user.avatar_id,
            deleted_at: null,
          },
        });
        return new UserDto(user, avatar);
      }
      return new UserDto(user);
    } catch (error) {
      Logger.error('Get me error' + error);
      throw new AppBadRequestException(ErrorCode.USER_NOT_FOUND);
    }
  }

  async updateMe(auth: UserEntity, body: UpdateMeDto): Promise<UserDto> {
    try {
      const { name, phoneNumber, password, avatarId } = body;
      const user = await this.usersRepository.findOne({
        where: {
          id: auth.id,
          deleted_at: null,
        },
        relations: ['avatar'],
      });
      if (!user) {
        throw new AppBadRequestException(ErrorCode.USER_NOT_FOUND);
      }
      let needUpdate = false;
      let avatar = null;
      if (name !== undefined && name !== user.name) {
        user.name = name;
        needUpdate = true;
      }
      if (phoneNumber !== undefined && phoneNumber !== user.phone_number) {
        user.phone_number = phoneNumber;
        needUpdate = true;
      }
      if (password !== undefined && password !== user.password) {
        user.password = password;
        needUpdate = true;
      }
      if (avatarId !== undefined && avatarId !== user.avatar_id) {
        avatar = await this.filesRepository.findOne({
          where: {
            id: avatarId,
            deleted_at: null,
          },
        });
        if (avatar) {
          user.avatar_id = avatarId;
          needUpdate = true;
        }
      }
      if (needUpdate) {
        await this.usersRepository.save(user);
      }
      return new UserDto(user, avatar);
    } catch (error) {
      Logger.error('Update user error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      } else {
        throw new AppBadRequestException(ErrorCode.UPDATE_TASK_ERROR);
      }
    }
  }

  async deleteUser(auth: UserEntity, id: string): Promise<any> {
    try {
      const task = await this.usersRepository.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });
      if (!task) {
        throw new AppBadRequestException(ErrorCode.USER_NOT_FOUND);
      }
      await this.usersRepository.update(id, {
        status: StatusAccount.DELETED as any,
      });
      return;
    } catch (error) {
      Logger.error('Delete user error' + error);
      if (error instanceof AppBadRequestException) {
        throw error;
      }
      throw new AppBadRequestException(ErrorCode.DELETE_USER_ERROR);
    }
  }
}
