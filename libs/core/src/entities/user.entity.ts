import { Column, Entity, Index } from 'typeorm';
import { DateEntity } from './with-date.entity';
import { WithId } from './with-id.entity';
import { Role } from '../constants';
import { StatusAccount } from '../constants/status-account';

@Entity({
  name: 'user',
})
export class UserEntity extends WithId(DateEntity) {
  @Index({ unique: true })
  @Column({ type: String, nullable: false })
  email: string | null;

  @Column({ type: String, nullable: false })
  password: string | null;

  @Column({ type: String, nullable: true, default: null })
  phone_number: string | null;

  @Column({ type: String, nullable: true })
  role: Role;

  @Column({ type: String, nullable: true })
  status: StatusAccount;

  @Column('jsonb', { nullable: true })
  additional_data: any;
}
