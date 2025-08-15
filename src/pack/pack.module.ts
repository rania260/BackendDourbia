import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';
import { StripeService } from './services/stripe.service';
import { Pack } from './entities/pack.entity';
import { PackPurchase } from './entities/pack-purchase.entity';
import { Circuit } from '../circuit/entities/circuit.entity';
import { Service } from '../service/entities/service.entity';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notifications/Notification.Module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pack, PackPurchase, Circuit, Service]),
    EmailModule,
    NotificationModule,
  ],
  controllers: [PackController],
  providers: [PackService, StripeService],
  exports: [PackService, TypeOrmModule],
})
export class PackModule {}
