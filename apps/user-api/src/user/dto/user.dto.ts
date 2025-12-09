import { PageQueryDto, Paginate, Role } from '@app/core';
import { StatusAccount } from '@app/core/constants/status-account';
import { UserEntity } from '@app/core/entities/user.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UserDto {
  id: string;
  email: string;
  phoneNumber: string;
  role: Role;
  status: StatusAccount;
  name: string;
  constructor(user: UserEntity) {
    this.id = user.id;
    this.email = user.email;
    this.phoneNumber = user.phone_number;
    this.role = user.role;
    this.status = user.status;
    this.name = user.name;
  }
}

export enum SortField {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'created_at',
}

export class QueryEmployeesDto extends PageQueryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @ApiPropertyOptional({
    description: 'Field that will be used for ordering',
    enum: SortField,
    default: SortField.CREATED_AT,
  })
  @IsEnum(SortField)
  @IsOptional()
  readonly sort: SortField = SortField.CREATED_AT;
}

export class UserPaginatedDto extends Paginate(UserDto) {}
