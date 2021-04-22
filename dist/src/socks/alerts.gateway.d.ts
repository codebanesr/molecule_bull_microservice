import { OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
export declare class AlertsGateway implements OnGatewayInit, OnGatewayDisconnect {
    handleDisconnect(client: Socket): void;
    wss: Server;
    private logger;
    afterInit(): void;
    sendMessageToClient(message: {
        room: string;
        text: string;
    }): void;
    handleRoomJoin(client: Socket, room: string): void;
    handleRoomLeave(client: Socket, room: string): void;
}
