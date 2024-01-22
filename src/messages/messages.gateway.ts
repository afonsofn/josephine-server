import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { MessageDto, isTypingDto } from './dto/message.dto';
import { SocketService } from '@/socket/socket.service';
import { MessageStatus, UserStatus } from '@prisma/client';
import { UsersService } from '@/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
    private socketService: SocketService,
    private userService: UsersService,
    private prismaService: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const clientId = client.id;

    if (!userId) return;

    console.log(`Cliente conectado: clientId-${clientId} userId-${userId}`);

    client.leave(clientId);
    client.join(userId);

    await this.socketService.addUserToOnlineList(userId);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { status: UserStatus.online },
    });

    const userContacts = await this.userService.getUserContacts(userId);

    userContacts.forEach(async (contact) => {
      const isContactOnline = await this.socketService.checkUserOnlineStatus(
        contact.userId.toString(),
      );

      if (isContactOnline)
        this.server
          .to(contact.userId.toString())
          .emit('chatStatusUpdate', true);
    });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) return;

    console.log(`Cliente desconectado: userId-${userId}`);

    await this.socketService.removeUserFromOnlineList(userId.toString());
    await this.prismaService.user.update({
      where: { id: userId },
      data: { status: UserStatus.offline },
    });

    const userContacts = await this.userService.getUserContacts(userId);

    userContacts.forEach(async (contact) => {
      const isContactOnline = await this.socketService.checkUserOnlineStatus(
        contact.userId.toString(),
      );

      if (isContactOnline)
        this.server
          .to(contact.userId.toString())
          .emit('chatStatusUpdate', false);
    });
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() messageData: MessageDto) {
    const userActiveChatId = await this.socketService.getUserActiveChatRoom(
      messageData.receiverId.toString(),
    );

    messageData.status =
      userActiveChatId &&
      messageData.senderId.toString() === userActiveChatId.toString()
        ? MessageStatus.readed
        : MessageStatus.sent;

    const message = await this.messagesService.sendMessage(messageData);

    this.server
      .to(messageData.receiverId.toString())
      .to(messageData.senderId.toString())
      .emit('message', message);

    return message;
  }

  @SubscribeMessage('getAllMessages')
  async getAllMessages(
    @MessageBody()
    {
      senderId,
      receiverId,
      page,
      pageSize,
    }: {
      senderId: string;
      receiverId: string;
      page: number;
      pageSize: number;
    },
  ) {
    return await this.messagesService.getAllMessages(
      senderId,
      receiverId,
      page,
      pageSize,
    );
  }

  @SubscribeMessage('typing')
  async typing(@MessageBody() { receiverId, name, isTyping }: isTypingDto) {
    this.server.to(receiverId.toString()).emit('typing', { name, isTyping });
  }

  @SubscribeMessage('markAllMessagesAsReaded')
  async markAllMessagesAsRead(
    @MessageBody()
    { receiverId, senderId }: { receiverId: string; senderId: string },
  ) {
    const lastMessage = await this.messagesService.markAllMessagesAsRead(
      receiverId,
      senderId,
    );

    this.server
      .to(receiverId.toString())
      .emit('lastMessagesReaded', lastMessage);
  }

  @SubscribeMessage('SetChatRoomId')
  async setChatRoomId(
    @MessageBody() { userId, chatId }: { userId: string; chatId: string },
  ) {
    if (chatId) return this.socketService.assignUserToChatRoom(userId, chatId);

    this.socketService.removeUserFromChatRoom(userId);
  }
}
