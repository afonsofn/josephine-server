import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { JwtGuard } from '@/auth/guards';
import { Response } from 'express';
import { MessagesService } from './messages.service';
import { JoinGroupChatDto, JoinUserChatDto } from './dto/message.dto';
import { SocketService } from '@/socket/socket.service';

@UseGuards(JwtGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private socketService: SocketService,
  ) {}

  @Post('join-chat')
  async joinChatRoom(
    @Body() chatInfo: JoinGroupChatDto | JoinUserChatDto,
    @Res() res: Response,
  ) {
    if ('groupId' in chatInfo) {
      await this.messagesService.joinGroupChat(chatInfo);

      return res.json({ message: 'mudar depois' });
    }

    await this.messagesService.joinUserChat(chatInfo);

    return res.json({ message: 'mudar depois' });
  }
}
