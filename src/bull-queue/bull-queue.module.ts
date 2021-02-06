import { BullModule, InjectQueue } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { config as loadEnvConfig } from 'dotenv';
import {join} from 'path';

loadEnvConfig();

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'leadQ',
      redis: {
        name: 'BullQueueWorker',
        host: process.env.BULL_REDIS_URL,
        port: +process.env.BULL_REDIS_PORT,
        password: process.env.BULL_REDIS_PASSWORD
      },
      processors: [join(__dirname, 'processors', 'lead-upload.processor.js')]
    })
  ],
  controllers: [],
  providers: []
})
export class BullQueueModule {}
