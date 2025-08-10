import { Exclude } from '@nestjs/class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  TableInheritance,
} from 'typeorm';
import { USERROLES } from '../../utils/enum';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Contribution } from 'src/contribution/entities/contribution.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: '' })
  avatar: string;

  @Column({
    type: 'enum',
    enum: USERROLES,
    default: USERROLES.USER,
  })
  role: USERROLES;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  googleId: string;

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => Contribution, (contribution) => contribution.user)
  contributions: Contribution[];
}
