import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { VerificationModule } from './verification/verification.module';
import { ContactModule } from './contact/contact.module';
import { DestinationModule } from './destination/destination.module';
import { CircuitModule } from './circuit/circuit.module';
import { MonumentModule } from './monument/monument.module';
import { BlogModule } from './blog/blog.module';
import { ReferenceModule } from './reference/reference.module';
import { PartnerModule } from './partner/partner.module';
import { ExpertModule } from './expert/expert.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ServiceModule } from './service/service.module';
import { ContributionModule } from './contribution/contribution.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'dourbia',
      autoLoadEntities: true,
      synchronize: true,
      logging:true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    AuthModule,
    EmailModule,
    VerificationModule,
    ContactModule,
    DestinationModule,
    CircuitModule,
    MonumentModule,
    BlogModule,
    ReferenceModule,
    PartnerModule,
    ExpertModule,
    FeedbackModule,
    ServiceModule,
    ContributionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}