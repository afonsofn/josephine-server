import { MessageStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsInt()
  @IsNotEmpty()
  contactId: number;

  @IsInt()
  @IsOptional()
  groupId?: number;

  @IsEnum(MessageStatus)
  @IsNotEmpty()
  status: MessageStatus;
}

export class JoinGroupChatDto {
  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class JoinUserChatDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class isTypingDto {
  @IsInt()
  @IsNotEmpty()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  isTyping: boolean;
}
