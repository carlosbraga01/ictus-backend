import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: Payment,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'List of all payments',
    type: [Payment],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment found',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.findOne(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by order ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment found',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findByOrder(@Param('orderId') orderId: string): Promise<Payment> {
    return this.paymentsService.findByOrder(orderId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all payments for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of payments for the user',
    type: [Payment],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByUser(@Param('userId') userId: string): Promise<Payment[]> {
    return this.paymentsService.findByUser(userId);
  }

  @Post(':id/confirm')
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Confirm a payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  confirm(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.confirm(id);
  }

  @Post(':id/cancel')
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Cancel a payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment cancelled successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  cancel(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.cancel(id);
  }
}
