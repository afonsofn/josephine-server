import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import * as argon from 'argon2';
import { EmailLogonDto, PhoneLogonDto, ProviderLoginDto } from '@/auth/dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CREDENTIALS_FAILED_EMAIL,
  CREDENTIALS_FAILED_PASSWORD,
  CREDENTIALS_INCORRECT,
  validateEmail,
  validatePassword,
} from '@/utils';
import { AuthService } from '@/auth/services/auth.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private prismaService: PrismaService,
  ) {}

  async getAndValidateUser(findCriteria: object, unverifiedMessage: string) {
    const user = await this.findUserByField(findCriteria);

    if (!user) throw new ForbiddenException(CREDENTIALS_INCORRECT);
    if (!user.verified) throw new ForbiddenException(unverifiedMessage);
    // TODO: MAYBE SEND EMAIL/SMS CONFIRMATION

    return user;
  }

  async createUser(
    dto: EmailLogonDto | PhoneLogonDto,
    hashProp?: string,
    verified: boolean = false,
  ) {
    let hash = hashProp;

    if (!hash && this.isEmailLogonDto(dto)) {
      if (!validateEmail(dto.email))
        throw new BadRequestException(CREDENTIALS_FAILED_EMAIL);

      if (!dto.provider && !validatePassword(dto.password))
        throw new BadRequestException(CREDENTIALS_FAILED_PASSWORD);

      hash = await argon.hash(dto.password);

      delete dto.password;
    }

    return await this.prismaService.user.create({
      data: { ...dto, hash, verified },
    });
  }

  async createProviderUser(dto: ProviderLoginDto) {
    const formatedDto = { ...dto, password: dto.providerId };

    delete formatedDto.providerId;

    const user = await this.createUser(formatedDto, null, true);

    return await this.authService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });
  }

  async findUserByField(field: { email?: string; phoneNumber?: string }) {
    if (field.email)
      return await this.prismaService.user.findUnique({
        where: { email: field.email },
      });

    return await this.prismaService.user.findUnique({
      where: { phoneNumber: field.phoneNumber },
    });
  }

  async verifyUser(userId: string, verified = true): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { verified },
    });
  }

  private isEmailLogonDto(dto: any): dto is EmailLogonDto {
    return dto.email !== undefined && dto.password !== undefined;
  }
}
