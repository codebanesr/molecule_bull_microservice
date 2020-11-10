import { Listener } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const options: CustomStrategy = {
    strategy: new Listener(
      'my-cluster' /* clusterID */,
      'user-service-listener' /* clientID */,
      'user-service-group' /* queueGroupName */,
      {
        url: 'http://127.0.0.1:4222',
      } /* TransportConnectOptions */,
      {
        durableName: 'user-queue-group',
        manualAckMode: true,
        deliverAllAvailable: true,
      } /* TransportSubscriptionOptions */,
    ),
  };

  // hybrid microservice and web application
  const app = await NestFactory.create(AppModule);
  const microService = app.connectMicroservice(options);
  microService.listen(() => app.listen(7733));
}
bootstrap();
