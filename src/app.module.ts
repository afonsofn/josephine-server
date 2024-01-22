import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { MessagesModule } from '@/messages/messages.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MessagesModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
