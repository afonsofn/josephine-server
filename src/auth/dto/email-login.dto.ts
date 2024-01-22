import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
