import { IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class PhoneLogonDto {
  @IsMobilePhone()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;
}
