import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { ProjectStatusEnum } from '../constants/project.enum';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';
import { ProjectEntity } from './project.entity';

@Entity({ name: 'project_customer' })
export class ProjectCustomerEntity extends WithId(DateEntity) {
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => UserEntity, (user) => user.projectCustomers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => ProjectEntity, (project) => project.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;
}
