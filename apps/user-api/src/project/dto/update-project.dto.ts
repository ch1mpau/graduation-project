import { ProjectStatusEnum } from '@app/core/constants/project.enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(ProjectStatusEnum)
  @IsOptional()
  status: ProjectStatusEnum;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  customers: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startAt?: number | null; // Timestamp in millis

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endAt?: number | null; // Timestamp in millis
}
