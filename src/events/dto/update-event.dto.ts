import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({ description: 'Slug do evento', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'URL do banner do evento', required: false })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;
}

