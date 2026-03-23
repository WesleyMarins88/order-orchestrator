import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export const ORDERS_QUEUE = 'orders';
export const FETCH_RATE_JOB = 'fetch-rate';

@Injectable()
export class OrdersQueue {
  constructor(@InjectQueue(ORDERS_QUEUE) private readonly queue: Queue) {}

  async enqueue(orderId: number, currency: string) {
    await this.queue.add(
      FETCH_RATE_JOB,
      { orderId, currency },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    );
  }

  async getMetrics() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }
}
