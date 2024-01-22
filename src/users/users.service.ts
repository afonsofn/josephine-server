import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { EditUserDto } from './dto';
import { CREDENTIALS_INCORRECT } from '@/utils';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUser(targetUserId: string, userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: targetUserId },
      include: { contactOf: true },
    });

    if (!user) throw new ForbiddenException(CREDENTIALS_INCORRECT);

    const contact = user.contactOf.find((c) => c.userId === userId);

    delete user.hash;
    delete user.contactOf;

    return {
      ...user,
      contactId: contact ? contact.id : null,
    };
  }

  async getUserContacts(userId: string) {
    const contacts = await this.prismaService.contact.findMany({
      where: { userId: userId },
    });

    if (!contacts) throw new ForbiddenException('User has no contacts');

    const contactDetails = await Promise.all(
      contacts.map(async (contact) => {
        const user = await this.prismaService.user.findUnique({
          where: { id: contact.contactId },
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
            status: true,
            id: true,
          },
        });

        const lastMessage = await this.prismaService.message.findMany({
          where: {
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        });

        const response = {
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          status: user.status,
          userId: user.id,
          contactId: contact.id,
          lastMessage: lastMessage[0] || null,
        };

        return response;
      }),
    );

    return contactDetails;
  }

  async editUser(userId: string, dto: EditUserDto) {
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    delete user.hash;

    return user;
  }
}
