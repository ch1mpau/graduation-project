import { PageQueryDto, Paginate, Role } from '@app/core';
import { StatusAccount } from '@app/core/constants/status-account';
import { FileEntity } from '@app/core/entities/image.entity';
import { UserEntity } from '@app/core/entities/user.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FileDto } from '../../file/dto/file.dto';

export class UserDto {
  id: string;
  email: string;
  phoneNumber: string;
  role: Role;
  status: StatusAccount;
  name: string;
  avatar: FileDto | null;
  avatar_id: string;
  constructor(user: UserEntity, avatar?: FileEntity | null) {
    this.id = user.id;
    this.email = user.email;
    this.phoneNumber = user.phone_number;
    this.role = user.role;
    this.status = user.status;
    this.name = user.name;
    this.avatar_id = user.avatar_id;
    this.avatar = !!user?.avatar
      ? new FileDto(user.avatar)
      : avatar
        ? new FileDto(avatar)
        : null;
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
