import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService, UserService, VerificationService } from '@/auth/services';
import {
  AuthController,
  EmailAuthController,
  PhoneAuthController,
  SocialAuthController,
} from '@/auth/controllers';
import {
  JwtStrategy,
  GoogleStrategy,
  FacebookStrategy,
} from '@/auth/strategies';
import { RedisService } from '@/redis/redis.service';
import { SocketService } from '@/socket/socket.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    UserService,
    VerificationService,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    RedisService,
    SocketService,
  ],
  controllers: [
    AuthController,
    EmailAuthController,
    PhoneAuthController,
    SocialAuthController,
  ],
  exports: [AuthService, UserService, VerificationService],
})
export class AuthModule {}
