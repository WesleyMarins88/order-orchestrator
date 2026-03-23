import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateOrderDto } from './create-order.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('orders')
  @HttpCode(HttpStatus.ACCEPTED)
  async receiveOrder(@Body() dto: CreateOrderDto) {
    return this.webhooksService.receiveOrder(dto);
  }
}
