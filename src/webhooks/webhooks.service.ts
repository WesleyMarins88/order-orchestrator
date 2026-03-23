import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersQueue } from '../queue/orders.queue';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersQueue: OrdersQueue,
  ) {}

  async receiveOrder(dto: CreateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: dto.idempotency_key },
    });

    if (existing) {
      this.logger.log(`Duplicate order received: ${dto.idempotency_key}`);
      return { id: existing.id, status: existing.status, duplicate: true };
    }

    const order = await this.prisma.order.create({
      data: {
        externalId: dto.order_id,
        idempotencyKey: dto.idempotency_key,
        customerEmail: dto.customer.email,
        customerName: dto.customer.name,
        currency: dto.currency,
        items: dto.items as unknown as Prisma.InputJsonValue,
        status: 'RECEIVED',
      },
    });

    await this.ordersQueue.enqueue(order.id, dto.currency);

    this.logger.log(`Order ${order.id} enqueued for processing`);

    return { id: order.id, status: order.status };
  }
}
