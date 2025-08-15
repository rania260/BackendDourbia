import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { User } from '../auth/entities/user.entity'; // 👈 à importer
import { EmailModule } from '../email/email.module';
import { PackModule } from '../pack/pack.module';
import { AuthModule } from '../auth/auth.module';

import { PackPurchase } from 'src/pack/entities/pack-purchase.entity';
import { ServiceModule } from 'src/service/service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, PackPurchase, User]), // ✅ Ajouter `User`
    EmailModule,
    PackModule,
    AuthModule,
    ServiceModule

  ],
  providers: [ReservationService],
  controllers: [ReservationController],
  exports: [ReservationService],
})
export class ReservationModule {}
