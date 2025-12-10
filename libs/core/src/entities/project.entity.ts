import { Column, Entity, Index } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { Role } from '../constants';
import { StatusAccount } from '../constants/status-account';
import { ProjectStatusEnum } from '../constants/project.enum';

@Entity({
  name: 'project',
})
export class ProjectEntity extends WithId(DateEntity) {
  @Column()
  owner_id: number;

  @Column({ type: String, nullable: true, default: null })
  name: string | null;

  @Column({ type: String, nullable: true })
  client: string;

  @Column({ type: String, nullable: true })
  status: ProjectStatusEnum;

  @Column({ type: String, nullable: true })
  type: string;
}
