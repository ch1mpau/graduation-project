import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { TaskEntity } from './task.entity';
import { FileEntity } from './image.entity';
import { UserEntity } from './user.entity';

@Entity({
  name: 'comment',
})
export class CommentEntity extends WithId(DateEntity) {
  @Column({ type: String, nullable: true })
  task_id: string;

  @Column({ type: String, nullable: true })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @ManyToOne(() => TaskEntity, (task) => task.comments, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'task_id', referencedColumnName: 'id' }])
  task: TaskEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UserEntity;

  @OneToMany(() => FileEntity, (file) => file.comment)
  files: FileEntity[];
}
