import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
import { Response } from 'express';
import { AuthService, VerificationService } from '@/auth/services';
import { PhoneLogonDto, PhoneLoginDto, PhoneVerificationDto } from '@/auth/dto';
import { CustomExceptionFilter } from '@/auth/filters/custom-exception.filter';

@Controller('auth')
@UseFilters(new CustomExceptionFilter())
export class PhoneAuthController {
  constructor(
    private authService: AuthService,
    private verificationService: VerificationService,
  ) {}

  @Post('register/phone')
  async logonPhone(@Body() dto: PhoneLogonDto, @Res() res: Response) {
    await this.authService.phoneLogon(dto);

    return res.json({
      message: 'User registered, please verify the SMS for activation',
    });
  }

  @Post('register/phone/verify')
  async registerPhoneVerify(
    @Body() dto: PhoneVerificationDto,
    @Res() res: Response,
  ) {
    const token = await this.verificationService.verifyPhoneLogon(dto);

    return res.json({ access_token: token });
  }

  @Post('login/phone')
  async loginPhone(@Body() dto: PhoneLoginDto, @Res() res: Response) {
    await this.authService.phoneLogin(dto);

    return res.json({
      message: 'Please confirm the SMS to proceed',
    });
  }

  @Post('login/phone/verify')
  async loginPhoneVerify(
    @Body() dto: PhoneVerificationDto,
    @Res() res: Response,
  ) {
    const token = await this.verificationService.verifyPhoneLogin(dto);

    return res.json({ access_token: token });
  }
}
