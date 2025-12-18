import { Column, Entity, Index, OneToMany } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { Role } from '../constants';
import { StatusAccount } from '../constants/status-account';
import { TaskEntity } from './task.entity';
import { ProjectEntity } from './project.entity';

@Entity({
  name: 'user',
})
export class UserEntity extends WithId(DateEntity) {
  @Index({ unique: true })
  @Column({ type: String, nullable: false })
  email: string | null;

  @Column({ type: String, nullable: true, default: null })
  name: string | null;

  @Column({ type: String, nullable: false })
  password: string | null;

  @Column({ type: String, nullable: true, default: null })
  phone_number: string | null;

  @Column({ type: String, nullable: true })
  role: Role;

  @Column({ type: String, nullable: true })
  status: StatusAccount;

  @Column({ type: String, nullable: true, default: null })
  avatar_id: string | null;

  @Column('jsonb', { nullable: true })
  additional_data: any;

  @OneToMany(() => ProjectEntity, (project) => project.user)
  projects: ProjectEntity[];

  @OneToMany(() => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];
}
