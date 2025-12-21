import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsArray()
  @IsOptional()
  fileIds: string[];
}
