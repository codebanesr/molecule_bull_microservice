import { Logger } from "@nestjs/common";
import { OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({namespace: 'alerts'})
export class AlertsGateway implements OnGatewayInit, OnGatewayDisconnect {
    handleDisconnect(client: Socket) {
        client.leaveAll();
        this.logger.debug("A client disconnected");
    }
    
    @WebSocketServer() wss: Server;

    private logger = new Logger(AlertsGateway.name);

    afterInit() {
        this.logger.debug("Initialized");
    }

    // this method will be used by microservice to convey to the frontend the status of the file
    sendMessageToClient(message: { room: string, text: string }) {
        this.logger.debug(`sending message to client, ${message.room}, ${message.text}`);
        this.wss.to(message.room).emit('chatToClient', message.text);
    }

    @SubscribeMessage('joinRoom')
    handleRoomJoin(client: Socket, room: string) {
        this.logger.debug(`received request to join room -> ${room}`);
        client.join(room);
        client.emit(`Joined room ${room}`);
    }

    @SubscribeMessage('leaveRoom')
    handleRoomLeave(client: Socket, room: string) {
        client.leave(room);
        client.emit('leftRoom', room);
    }
}