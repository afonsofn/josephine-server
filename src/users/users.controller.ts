import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '@/auth/decorators';
import { JwtGuard } from '@/auth/guards';
import { EditUserDto } from './dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get('me/contacts')
  getMyContacts(@GetUser() user: User) {
    return this.userService.getUserContacts(user.id);
  }

  @Get(':id')
  getUser(@Param('id') targetUserId: string, @GetUser() user: User) {
    return this.userService.getUser(targetUserId, user.id);
  }

  @Get(':id/contacts')
  getUserContacts(@Param('id') userId: string) {
    return this.userService.getUserContacts(userId);
  }

  @Patch()
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
