import { Module } from '@nestjs/common';
import { MessagesService } from '@/messages/messages.service';
import { MessagesGateway } from '@/messages/messages.gateway';
import { MessagesController } from '@/messages/messages.controller';
import { SocketService } from '@/socket/socket.service';
import { RedisService } from '@/redis/redis.service';
import { UsersService } from '@/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesGateway,
    SocketService,
    UsersService,
    RedisService,
    PrismaService,
  ],
})
export class MessagesModule {}
