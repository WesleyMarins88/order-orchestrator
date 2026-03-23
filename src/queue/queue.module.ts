import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersQueue, ORDERS_QUEUE } from './orders.queue';
import { OrdersProcessor } from './orders.processor';
import { ExchangeModule } from '../exchange/exchange.module';
import { QueueController } from './queue.controller';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: ORDERS_QUEUE }),
    ExchangeModule,
  ],
  controllers: [QueueController],
  providers: [OrdersQueue, OrdersProcessor],
  exports: [OrdersQueue],
})
export class QueueModule {}
