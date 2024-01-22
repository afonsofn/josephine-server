import { Controller, Get, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '@/auth/services';

import { FacebookGuard, GoogleGuard } from '@/auth/guards';
import { GetUser } from '@/auth/decorators';
import { CustomExceptionFilter } from '@/auth/filters/custom-exception.filter';

@Controller('auth')
@UseFilters(new CustomExceptionFilter())
export class SocialAuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  googleAuth() {}

  @Get('facebook')
  @UseGuards(FacebookGuard)
  facebookAuth() {}

  @Get('google/callback')
  @Get('facebook/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@GetUser() user, @Res() res: Response) {
    const token = await this.authService.providersLogin(user);

    return res.json({ access_token: token });
  }

  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  async facebookCallback(@GetUser() user, @Res() res: Response) {
    const token = await this.authService.providersLogin(user);

    return res.json({ access_token: token });
  }
}
