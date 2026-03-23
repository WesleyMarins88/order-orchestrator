import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { Prisma } from '@prisma/client';
import { ORDERS_QUEUE, FETCH_RATE_JOB } from './orders.queue';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeService } from '../exchange/exchange.service';

@Processor(ORDERS_QUEUE)
export class OrdersProcessor {
  private readonly logger = new Logger(OrdersProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly exchange: ExchangeService,
  ) {}

  @Process(FETCH_RATE_JOB)
  async handleExchange(job: Job<{ orderId: number; currency: string }>) {
    const { orderId, currency } = job.data;

    this.logger.log(`Processing order ${orderId} (attempt ${job.attemptsMade + 1})`);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    const rateData = await this.exchange.fetchRate(currency);

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ENRICHED',
        exchangeData: rateData as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Order ${orderId} processed successfully`);
  }

  @OnQueueFailed()
  async handleFailure(job: Job<{ orderId: number }>, error: Error) {
    const maxAttempts = job.opts.attempts ?? 1;
    const isLastAttempt = job.attemptsMade >= maxAttempts;

    if (!isLastAttempt) {
      this.logger.warn(
        `Order ${job.data.orderId} failed attempt ${job.attemptsMade}, retrying...`,
      );
      return;
    }

    this.logger.error(
      `Order ${job.data.orderId} exhausted all retries: ${error.message}`,
    );

    await this.prisma.order.update({
      where: { id: job.data.orderId },
      data: {
        status: 'FAILED_ENRICHMENT',
        errorMessage: error.message,
      },
    });
  }
}
