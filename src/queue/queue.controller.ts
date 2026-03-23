import { Controller, Get } from '@nestjs/common';
import { OrdersQueue } from './orders.queue';

@Controller('queue')
export class QueueController {
  constructor(private readonly ordersQueue: OrdersQueue) {}

  @Get('metrics')
  getMetrics() {
    return this.ordersQueue.getMetrics();
  }
}
