import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'User name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'User Phone' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'User role', enum: Role, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
