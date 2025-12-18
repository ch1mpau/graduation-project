import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UploadProjectFilesDto {
  @IsUUID()
  @IsOptional()
  taskId: string;

  @IsUUID()
  @IsOptional()
  projectId: string;

  @IsArray()
  @IsOptional()
  fileIds: string[];
}
