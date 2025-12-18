import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMeDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsUUID()
  @IsOptional()
  avatarId: string;
}
