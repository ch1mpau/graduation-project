import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { ProjectStatusEnum } from '../constants/project.enum';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';
import { ProjectEntity } from './project.entity';

@Entity({ name: 'task_user' })
export class UserTaskEntity extends WithId(DateEntity) {
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => UserEntity, (user) => user.taskUsers, {})
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => TaskEntity, (task) => task.users, {})
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;
}
