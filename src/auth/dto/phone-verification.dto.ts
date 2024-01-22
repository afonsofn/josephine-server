import { IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class PhoneVerificationDto {
  @IsMobilePhone()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
