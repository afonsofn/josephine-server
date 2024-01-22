import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { RedisService } from '@/redis/redis.service';
import { RedisModule } from '@/redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [SocketService, RedisService],
  exports: [SocketService],
})
export class SocketModule {}
