import { IsString } from 'class-validator';

export class HashPasswordDto {
  @IsString()
  password: string;
}
