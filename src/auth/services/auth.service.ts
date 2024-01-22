import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import * as argon from 'argon2';
import {
  EmailLoginDto,
  ProviderLoginDto,
  EmailLogonDto,
  PhoneLogonDto,
  PhoneLoginDto,
} from '@/auth/dto';
import { RedisService } from '@/redis/redis.service';
import { UserService } from '@/auth/services';
import {
  CREDENTIALS_INCORRECT,
  CREDENTIALS_TAKEN_BY_JWT,
  CREDENTIALS_TAKEN_PROVIDER_CONFLICT,
  EMAIL_NOT_VERIFIED,
  JWT_EXPIRE_TIME,
  JWT_SECRET,
  PHONE_NOT_VERIFIED,
  UNAUTHENTICATED,
  handleExceptions,
} from '@/utils';

@Injectable()
export class AuthService {
  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async emailLogon(dto: EmailLogonDto) {
    try {
      await this.userService.createUser(dto);

      // TODO: SEND THE EMAIL CONFIRMATION
    } catch (error) {
      handleExceptions(error);
    }
  }

  async phoneLogon(dto: PhoneLogonDto) {
    try {
      const hash = await argon.hash(dto.phoneNumber);

      await this.userService.createUser(dto, hash);

      // TODO: SEND THE SMS CONFIRMATION
    } catch (error) {
      handleExceptions(error);
    }
  }

  async emailLogin({ email, password }: EmailLoginDto) {
    try {
      const user = await this.userService.getAndValidateUser(
        { email },
        EMAIL_NOT_VERIFIED,
      );

      this.validateHash(user.hash, password);

      return await this.generateAccessToken({
        sub: user.id,
        email: user.email,
      });
    } catch (error) {
      handleExceptions(error);
    }
  }

  async phoneLogin({ phoneNumber }: PhoneLoginDto) {
    try {
      await this.userService.getAndValidateUser(
        { phoneNumber },
        PHONE_NOT_VERIFIED,
      );

      // SEND THE SMS CONFIRMATION
    } catch (error) {
      handleExceptions(error);
    }
  }

  async providersLogin(dto: ProviderLoginDto) {
    try {
      if (!dto) throw new ForbiddenException(UNAUTHENTICATED);

      const user = await this.userService.findUserByField({ email: dto.email });

      if (!user) return this.userService.createProviderUser(dto);

      if (!user.provider)
        throw new ForbiddenException(CREDENTIALS_TAKEN_BY_JWT);

      if (user.provider !== dto.provider)
        throw new ForbiddenException(CREDENTIALS_TAKEN_PROVIDER_CONFLICT);

      this.validateHash(user.hash, dto.providerId);

      return await this.generateAccessToken({
        sub: user.id,
        email: user.email,
      });
    } catch (error) {
      handleExceptions(error);
    }
  }

  async logout(token: string) {
    try {
      const expiryTime = this.getRemainingTokenTime(token);

      await this.redisService.addToBlacklist(token, expiryTime);
    } catch (error) {
      handleExceptions(error);
    }
  }

  async generateAccessToken(payload: { sub: string; email: string }) {
    const secret = this.configService.get(JWT_SECRET);

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: JWT_EXPIRE_TIME,
      secret,
    });

    return access_token;
  }

  async validateHash(hash: string, plain: string) {
    const pwMatches = await argon.verify(hash, plain);

    if (!pwMatches) throw new ForbiddenException(CREDENTIALS_INCORRECT);
  }

  private getRemainingTokenTime(token: string): number {
    const decodedToken = this.jwtService.decode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    return decodedToken.exp - currentTime;
  }
}
