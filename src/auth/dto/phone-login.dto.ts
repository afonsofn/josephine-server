import { IsMobilePhone, IsNotEmpty } from 'class-validator';

export class PhoneLoginDto {
  @IsMobilePhone()
  @IsNotEmpty()
  phoneNumber: string;
}
