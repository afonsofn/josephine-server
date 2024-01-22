import { Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from '@/auth/services';

import { JwtGuard } from '@/auth/guards';
import { GetToken, GetUser } from '@/auth/decorators';
import { CustomExceptionFilter } from '@/auth/filters/custom-exception.filter';
import { SocketService } from '@/socket/socket.service';

@Controller('auth')
@UseFilters(new CustomExceptionFilter())
export class AuthController {
  constructor(
    private authService: AuthService,
    private socketService: SocketService,
  ) {}

  @Post('logout')
  @UseGuards(JwtGuard)
  logout(@GetToken() token: string, @GetUser() user) {
    this.socketService.removeUserFromOnlineList(user.id);

    return this.authService.logout(token);
  }
}
