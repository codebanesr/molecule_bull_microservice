import { NatsStreamingTransport } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    NatsStreamingTransport.register({
      clientId: 'user-service-publisher',
      clusterId: 'my-cluster',
      connectOptions: {
        url: 'http://127.0.0.1:4222',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
