import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullQueueModule } from './bull-queue/bull-queue.module';

@Module({
  imports: [
    BullQueueModule,
    MongooseModule.forRoot(process.env.MONGODB_URI, {useNewUrlParser: true}),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
