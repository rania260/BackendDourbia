import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { Contribution } from './entities/contribution.entity';
import { User } from 'src/auth/entities/user.entity';
import { Monument } from 'src/monument/entities/monument.entity';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/contributions',
    }),
    TypeOrmModule.forFeature([Contribution, User, Monument]),
  ],
  controllers: [ContributionController],
  providers: [ContributionService],
})
export class ContributionModule {}
