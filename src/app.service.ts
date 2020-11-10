import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Injectable } from '@nestjs/common';
import { UserCreatedEvent } from './examples/user-created.event';
import { Patterns } from './examples/user.enum';

@Injectable()
export class AppService {
  constructor(private publisher: Publisher) {}
  getHello(): string {
    const event: UserCreatedEvent = {
      id: Math.floor(Math.random() * Math.floor(1000)),
      username: 'bernt',
    };
    this.publisher
      .emit<string, UserCreatedEvent>(Patterns.UserCreated, event)
      .subscribe(guid => {
        console.log('published message with guid:', guid);
      });
    return `published message: ${JSON.stringify(event)}`;
  }
}
