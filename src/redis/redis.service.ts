import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis();
  }

  async addToBlacklist(token: string, expiryTime: number): Promise<void> {
    await this.redisClient.set(token, token, 'EX', expiryTime);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisClient.get(token);

    return result !== null;
  }

  async addToList(listKey: string, value: string): Promise<void> {
    await this.redisClient.lpush(listKey, value);
  }

  async removeFromList(listKey: string, value: string): Promise<void> {
    await this.redisClient.lrem(listKey, 0, value);
  }

  async isValueInList(listKey: string, value: string): Promise<boolean> {
    const list = await this.redisClient.lrange(listKey, 0, -1);

    return list.includes(value);
  }

  async addUserToRoom(userId: string, chatId: string): Promise<void> {
    await this.redisClient.set(userId, chatId);
  }

  async removeUserFromRoom(userId: string): Promise<void> {
    await this.redisClient.del(userId);
  }

  async isUserInRoom(userId: string): Promise<string | null> {
    return await this.redisClient.get(userId);
  }
}
