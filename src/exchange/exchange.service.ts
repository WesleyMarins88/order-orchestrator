import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('EXCHANGE_API_URL', 'https://economia.awesomeapi.com.br');
  }

  async fetchRate(currency: string): Promise<Record<string, unknown>> {
    const pair = currency !== 'BRL' ? `${currency}-BRL` : 'USD-BRL';

    this.logger.log(`Fetching exchange rate for ${pair}`);

    const response = await axios.get(`${this.baseUrl}/json/last/${pair}`, {
      timeout: 5000,
    });

    const key = Object.keys(response.data)[0];
    const rate = response.data[key];

    return {
      exchange_rate: {
        pair,
        bid: rate.bid,
        ask: rate.ask,
        timestamp: rate.timestamp,
      },
      fetched_at: new Date().toISOString(),
    };
  }
}
