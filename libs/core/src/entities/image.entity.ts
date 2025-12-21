import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { ProjectEntity } from './project.entity';
import { TaskEntity } from './task.entity';
import { FileType } from '../constants/file.enum';
import { CommentEntity } from './comment.entity';

@Entity({
  name: 'file',
})
export class FileEntity extends WithId(DateEntity) {
  @Column({ type: String, nullable: true, default: null })
  path: string | null;

  @Column({ type: String, nullable: true })
  project_id: string;

  @Column({ type: String, nullable: true })
  comment_id: string;

  @Column({ type: String, nullable: true })
  task_id: string;

  @Column({ type: String, nullable: true })
  type: FileType;

  @ManyToOne(() => ProjectEntity, (project) => project.files, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'project_id', referencedColumnName: 'id' }])
  project: ProjectEntity;

  @ManyToOne(() => TaskEntity, (task) => task.files, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'task_id', referencedColumnName: 'id' }])
  task: TaskEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.files, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'comment_id', referencedColumnName: 'id' }])
  comment: CommentEntity;
}
