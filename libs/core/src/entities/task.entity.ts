import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { TaskPriorityEnum, TaskStatusEnum } from '../constants/project.enum';
import { WithId } from './with-id.entity';
import { ProjectEntity } from './project.entity';
import { UserEntity } from './user.entity';
import { UserTaskEntity } from './task-user.entity';

@Entity({
  name: 'task',
})
export class TaskEntity extends WithId(DateEntity) {
  @Column({ type: String, nullable: true, default: null })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: String, nullable: true })
  priority: TaskPriorityEnum;

  @Column({ type: String, nullable: true, default: TaskStatusEnum.STARTED })
  status: TaskStatusEnum;

  @Column({ type: String, nullable: true })
  project_id: string;

  @Column({ type: 'timestamptz', nullable: true })
  start_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  end_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;

  @ManyToOne(() => ProjectEntity, (project) => project.tasks, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'project_id', referencedColumnName: 'id' }])
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, (user) => user.tasks, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UserEntity;

  @OneToMany(() => UserTaskEntity, (ut) => ut.task)
  userTasks: UserTaskEntity[];
}
