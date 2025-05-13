import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the event organizer (must be a user with ORGANIZER role)',

  })
  @IsUUID()
  organizerId: string;

  @ApiProperty({
    example: 'Conferência de Jovens 2025',
    description: 'Title of the event that will be displayed to users',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'evento-do-ano-2025-teste',
    description: 'Slug (URL amigável) do evento. Deve ser único e apenas com letras, números e hifens.'
  })
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'https://cdn.site.com/banner.jpg',
    description: 'URL da imagem de banner do evento',
    required: false
  })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiProperty({
    example: 'Uma conferência transformadora para jovens cristãos com louvor, pregação e comunhão',
    description: 'Detailed description of the event, including activities and schedule',
    required: false,

  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Igreja Batista Central - Rua Principal, 123, Centro, São Paulo - SP',
    description: 'Physical location where the event will take place',
    required: false,

  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: '2025-07-15T19:00:00Z',
    description: 'Date and time of the event in ISO 8601 format',

  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 300,
    description: 'Maximum number of attendees allowed at the event',
    required: false,

  })
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    example: false,
    description: 'Whether the event is free to attend. If false, price must be set',
    required: false,
    default: false,

  })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiProperty({
    example: 49.9,
    description: 'Price per ticket in BRL (Brazilian Reais). Required if isFree is false',
    required: false,

  })
  @IsNumber()
  @IsOptional()
  price?: number;
}
