import { ProjectStatusEnum } from '@app/core/constants/project.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsOptional()
  client: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProjectStatusEnum)
  @IsOptional()
  status: ProjectStatusEnum = ProjectStatusEnum.PENDING;
}
