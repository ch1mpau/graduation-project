import { ProjectStatusEnum } from '@app/core/constants/project.enum';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProjectStatusEnum)
  @IsOptional()
  status: ProjectStatusEnum = ProjectStatusEnum.PENDING;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startAt?: number | null; // Timestamp in millis

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endAt?: number | null; // Timestamp in millis
}
