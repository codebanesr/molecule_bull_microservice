import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload, Ctx } from '@nestjs/microservices';
import { AppService } from './app.service';
import { Patterns } from './examples/user.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern(Patterns.UserCreated)
  public async stationCreatedHandler(
    @Payload() data: { id: number; name: string },
    @Ctx() context: NatsStreamingContext,
  ) {
    console.log(`received message: ${JSON.stringify(data)}`);
    context.message.ack();
  }
}
