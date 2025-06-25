import { Exclude } from '@nestjs/class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { USERROLES } from '../../utils/enum';
import { Partner } from '../../partner/partner.entity';
import { Expert } from 'src/expert/entities/expert.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Contribution } from 'src/contribution/entities/contribution.entity';

@Entity()
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

  @Column({default: ''})
  avatar: string;

  @Column({
    type: 'enum',
    enum: USERROLES,  
    default: USERROLES.USER,  
  })
  role: USERROLES;

  @Column({nullable: true})
  phone: string;

  @Column({nullable: true})
  country: string;

  @Column({nullable: true})
  region: string;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  googleId: string;

  @OneToOne(() => Partner, partner => partner.user, { eager: true }) 
  @JoinColumn()
  partner: Partner;
  
  @OneToOne(() => Expert, expert => expert.user)
  @JoinColumn()
  expert: Expert;

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => Contribution, (contribution) => contribution.user)
  contributions: Contribution[];

}
