import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService, VerificationService } from '@/auth/services';
import { EmailLoginDto, EmailLogonDto, EmailVerificationDto } from '@/auth/dto';
import { CustomExceptionFilter } from '@/auth/filters/custom-exception.filter';

@Controller('auth')
@UseFilters(new CustomExceptionFilter())
export class EmailAuthController {
  constructor(
    private authService: AuthService,
    private verificationService: VerificationService,
  ) {}

  @Post('register/email')
  async registerEmail(@Body() dto: EmailLogonDto, @Res() res: Response) {
    await this.authService.emailLogon(dto);

    return res.status(HttpStatus.OK).json({
      message: 'User registered, please verify your email for activation',
    });
  }

  @Post('register/email/verify')
  async registerEmailVerify(
    @Body() dto: EmailVerificationDto,
    @Res() res: Response,
  ) {
    const token = await this.verificationService.verifyEmailLogon(dto);

    return res.json({ access_token: token });
  }

  @Post('login/email')
  async loginEmail(@Body() dto: EmailLoginDto, @Res() res: Response) {
    const token = await this.authService.emailLogin(dto);

    return res.json({ access_token: token });
  }
}
