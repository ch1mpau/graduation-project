import { PageQueryDto, Paginate } from '@app/core';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FileDto } from '../../file/dto/file.dto';
import { UserDto } from '../../user/dto/user.dto';
import { CommentEntity } from '@app/core/entities/comment.entity';

export class CommentDto {
  id: string;
  content: string;
  user: UserDto;
  files?: FileDto[];
  createdAt: number;
  constructor(comment: CommentEntity) {
    this.id = comment.id;
    this.content = comment.content;
    this.user = new UserDto(comment.user);
    this.createdAt = comment.created_at.getTime();
    this.files =
      (!!comment?.files && comment.files.map((file) => new FileDto(file))) ||
      [];
  }
}
