"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AlertsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
let AlertsGateway = AlertsGateway_1 = class AlertsGateway {
    constructor() {
        this.logger = new common_1.Logger(AlertsGateway_1.name);
    }
    handleDisconnect(client) {
        client.leaveAll();
        this.logger.debug("A client disconnected");
    }
    afterInit() {
        this.logger.debug("Initialized");
    }
    sendMessageToClient(message) {
        this.wss.to(message.room).emit('chatToClient', message.text);
    }
    handleRoomJoin(client, room) {
        this.logger.debug(`received request to join room -> ${room}`);
        client.join(room);
        client.emit(`Joined room ${room}`);
    }
    handleRoomLeave(client, room) {
        client.leave(room);
        client.emit('leftRoom', room);
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Object)
], AlertsGateway.prototype, "wss", void 0);
__decorate([
    websockets_1.SubscribeMessage('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AlertsGateway.prototype, "handleRoomJoin", null);
__decorate([
    websockets_1.SubscribeMessage('leaveRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AlertsGateway.prototype, "handleRoomLeave", null);
AlertsGateway = AlertsGateway_1 = __decorate([
    websockets_1.WebSocketGateway({ namespace: 'alerts' })
], AlertsGateway);
exports.AlertsGateway = AlertsGateway;
//# sourceMappingURL=alerts.gateway.js.map