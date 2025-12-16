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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
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
        qb.andWhere('user.role = :qRole', { qRole: query.role });
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
      Logger.error('Get employees error', error);
      throw new AppBadRequestException(ErrorCode.GET_EMPLOYEES_ERROR);
    }
  }

  async getMe(auth: UserEntity): Promise<UserDto> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: auth.id, deleted_at: null, status: StatusAccount.ACTIVE },
      });
      return new UserDto(user);
    } catch (error) {
      Logger.error('Get me error', error);
      throw new AppBadRequestException(ErrorCode.USER_NOT_FOUND);
    }
  }
}
