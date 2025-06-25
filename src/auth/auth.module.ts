import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Expert } from '../expert/entities/expert.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy'; 
import { AuthGuard } from './guards/auth.guard'; 
import { EmailModule } from 'src/email/email.module';
import { VerificationModule } from 'src/verification/verification.module';
// import { GoogleAuthGuard } from './guards/google-auth-guard';
// import { PartnerModule } from '../partner/partner.module';
// import { ExpertModule } from '../expert/expert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Expert]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    EmailModule,
    VerificationModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtStrategy],
  exports: [AuthGuard, AuthService, TypeOrmModule.forFeature([User])]
})
export class AuthModule {}
