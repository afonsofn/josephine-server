import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EmailVerificationDto, PhoneVerificationDto } from '@/auth/dto';
import { AuthService, UserService } from '@/auth/services';
import {
  CREDENTIALS_INCORRECT,
  VERIFICATION_CODE_INCORRECT,
  handleExceptions,
} from '@/utils';

@Injectable()
export class VerificationService {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async verifyEmailLogon({
    email,
    verificationCode,
  }: EmailVerificationDto): Promise<string> {
    try {
      const user = await this.userService.findUserByField({ email });

      if (!user) throw new ForbiddenException(CREDENTIALS_INCORRECT);

      if (verificationCode !== '123')
        throw new BadRequestException(VERIFICATION_CODE_INCORRECT);

      await this.userService.verifyUser(user.id);

      return await this.authService.generateAccessToken({
        sub: user.id,
        email: user.email,
      });
    } catch (error) {
      handleExceptions(error);
    }
  }

  async verifyPhoneLogon({
    phoneNumber,
    verificationCode,
  }: PhoneVerificationDto): Promise<string> {
    try {
      const user = await this.userService.findUserByField({ phoneNumber });

      if (!user) throw new ForbiddenException(CREDENTIALS_INCORRECT);

      if (verificationCode !== '123')
        throw new BadRequestException(VERIFICATION_CODE_INCORRECT);

      await this.userService.verifyUser(user.id);

      return await this.authService.generateAccessToken({
        sub: user.id,
        email: user.email,
      });
    } catch (error) {
      handleExceptions(error);
    }
  }

  async verifyPhoneLogin({
    phoneNumber,
    verificationCode,
  }: PhoneVerificationDto): Promise<string> {
    try {
      const user = await this.userService.findUserByField({ phoneNumber });

      if (!user) throw new ForbiddenException(CREDENTIALS_INCORRECT);

      if (verificationCode !== '123')
        throw new BadRequestException(VERIFICATION_CODE_INCORRECT);

      this.authService.validateHash(user.hash, phoneNumber);

      return await this.authService.generateAccessToken({
        sub: user.id,
        email: user.email,
      });
    } catch (error) {
      handleExceptions(error);
    }
  }
}
