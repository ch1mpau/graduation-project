import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { ProjectStatusEnum } from '../constants/project.enum';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

@Entity({
  name: 'project',
})
export class ProjectEntity extends WithId(DateEntity) {
  @Column({ type: String, nullable: true })
  owner_id: string;

  @Column({ type: String, nullable: true, default: null })
  name: string | null;

  @Column({ type: String, nullable: true })
  client: string;

  @Column({ type: String, nullable: true })
  status: ProjectStatusEnum;

  @Column({ type: String, nullable: true })
  type: string;

  @OneToMany(() => TaskEntity, (task) => task.project)
  tasks: TaskEntity[];

  @ManyToOne(() => UserEntity, (user) => user.projects, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'owner_id', referencedColumnName: 'id' }])
  user: UserEntity;
}
