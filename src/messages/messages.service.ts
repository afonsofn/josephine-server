import { Injectable } from '@nestjs/common';
import {
  JoinGroupChatDto,
  JoinUserChatDto,
  MessageDto,
} from './dto/message.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Message, MessageStatus, Prisma } from '@prisma/client';
import { handleExceptions } from '@/utils';

@Injectable()
export class MessagesService {
  constructor(private prismaService: PrismaService) {}

  async sendMessage(messageData: MessageDto) {
    try {
      const message: Prisma.MessageCreateInput = {
        content: messageData.content,
        groupId: messageData.groupId,
        status: messageData.status,
        sender: { connect: { id: messageData.senderId } },
        receiver: { connect: { id: messageData.receiverId } },
        contact: { connect: { id: messageData.contactId } },
      };

      return await this.prismaService.message.create({ data: message });
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getAllMessages(
    receiverId: string,
    senderId: string,
    page: number,
    pageSize: number,
  ) {
    try {
      console.log(receiverId, senderId, page, pageSize);

      return this.prismaService.message.findMany({
        where: {
          OR: [
            { receiverId: receiverId, senderId: senderId },
            { receiverId: senderId, senderId: receiverId },
          ],
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      handleExceptions(error);
    }
  }

  async joinGroupChat({ groupId, userId }: JoinGroupChatDto) {
    try {
      const groupExists = await this.prismaService.group.findUnique({
        where: { id: groupId },
      });

      if (!groupExists) throw new Error('Grupo não encontrado.');

      const userExists = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) throw new Error('Usuário não encontrado.');

      const isMember = await this.prismaService.groupMember.findUnique({
        where: { groupId_userId: { groupId: groupId, userId: userId } },
      });

      if (isMember) throw new Error('Usuário já é membro deste grupo.');

      await this.prismaService.groupMember.create({
        data: {
          group: { connect: { id: groupId } },
          user: { connect: { id: userId } },
        },
      });
    } catch (error) {
      handleExceptions(error);
    }
  }

  async joinUserChat({ targetUserId, userId }: JoinUserChatDto) {
    try {
      const targetUserExists = await this.prismaService.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUserExists) throw new Error('Usuário alvo não encontrado.');

      const userExists = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) throw new Error('Usuário não encontrado.');

      const contactExists = await this.prismaService.contact.findFirst({
        where: {
          OR: [
            { userId: userId, contactId: targetUserId },
            { userId: targetUserId, contactId: userId },
          ],
        },
      });

      if (!contactExists) {
        await this.prismaService.contact.create({
          data: {
            userId: userId,
            contactId: targetUserId,
          },
        });

        await this.prismaService.contact.create({
          data: {
            userId: targetUserId,
            contactId: userId,
          },
        });
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async markAllMessagesAsRead(
    receiverId: string,
    senderId: string,
  ): Promise<Message> {
    await this.prismaService.message.updateMany({
      where: {
        receiverId: receiverId,
        senderId: senderId,
        status: { in: [MessageStatus.sent, MessageStatus.received] },
      },
      data: {
        status: MessageStatus.readed,
      },
    });

    return this.prismaService.message.findFirst({
      where: {
        OR: [
          { receiverId: receiverId, senderId: senderId },
          { receiverId: senderId, senderId: receiverId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
