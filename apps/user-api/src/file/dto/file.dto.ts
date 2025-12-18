import { FileType } from '@app/core/constants/file.enum';
import { FileEntity } from '@app/core/entities/image.entity';

export class FIleDto {
  id: string;
  type: FileType;
  projectId: string;
  taskId: string;
  createdAt: number;
  path: string;
  constructor(file: FileEntity) {
    this.id = file.id;
    this.path = process.env.FILE_URL + '/' + file.path;
    this.type = file.type;
    this.projectId = file.project_id;
    this.taskId = file.task_id;
    this.createdAt = file.created_at.getTime();
  }
}
