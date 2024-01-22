import { Injectable } from '@nestjs/common';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class SocketService {
  constructor(private redisService: RedisService) {}

  async addUserToOnlineList(userId: string) {
    await this.redisService.addToList('activeSockets', userId);
  }

  async removeUserFromOnlineList(userId: string) {
    await this.redisService.removeFromList('activeSockets', userId);
  }

  async checkUserOnlineStatus(userId: string): Promise<boolean> {
    return await this.redisService.isValueInList('activeSockets', userId);
  }

  async assignUserToChatRoom(userId: string, chatId: string) {
    await this.redisService.addUserToRoom(userId, chatId);
  }

  async removeUserFromChatRoom(userId: string) {
    await this.redisService.removeUserFromRoom(userId);
  }

  async getUserActiveChatRoom(userId: string): Promise<string | null> {
    return await this.redisService.isUserInRoom(userId);
  }
}
