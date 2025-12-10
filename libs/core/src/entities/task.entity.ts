import { Column, Entity, Index } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { Role } from '../constants';
import { StatusAccount } from '../constants/status-account';
import { ProjectStatus, TaskPriorityEnum } from '../constants/project.enum';

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

  @Column({ type: String, nullable: true })
  status: ProjectStatus;
}
