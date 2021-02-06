import { Module } from '@nestjs/common';
import { BullQueueModule } from './bull-queue/bull-queue.module';

@Module({
  imports: [BullQueueModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
