import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expert } from './entities/expert.entity';
import { User } from '../auth/entities/user.entity';
import { ExpertController } from './expert.controller';
import { ExpertService } from './expert.service';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    EmailModule,
    TypeOrmModule.forFeature([Expert, User]),
  ],
  controllers: [ExpertController],
  providers: [ExpertService],
  exports: [ExpertService],
})
export class ExpertModule {}
