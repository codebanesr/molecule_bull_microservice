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

}
