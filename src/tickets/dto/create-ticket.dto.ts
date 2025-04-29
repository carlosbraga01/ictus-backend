import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../entities/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({
    example: '7d1aa890-f28b-41d4-a716-446655440000',
    description: 'UUID of the event this ticket is for',
  })
  @IsUUID()
  eventId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the user who will receive this ticket',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  buyerId?: string;

  @ApiProperty({
    enum: TicketStatus,
    example: TicketStatus.AVAILABLE,
    description: 'Status of the ticket. New tickets are AVAILABLE by default',
    required: false,
    default: TicketStatus.AVAILABLE,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({
    example: 1,
    description: 'Quantidade de tickets a serem criados',
    required: false,
    default: 1,
  })
  @IsOptional()
  quantidade?: number;
}
