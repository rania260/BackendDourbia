import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { User } from '../auth/entities/user.entity';
import { Partner } from './partner.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    EmailModule,
    TypeOrmModule.forFeature([Partner]),
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [
    TypeOrmModule.forFeature([Partner]),
    TypeOrmModule.forFeature([User]),
  ],
})
export class PartnerModule {}
