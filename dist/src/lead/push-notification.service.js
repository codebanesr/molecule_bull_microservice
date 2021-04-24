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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const web_push_1 = require("web-push");
const config_1 = require("../config");
let PushNotificationService = class PushNotificationService {
    constructor() {
        web_push_1.setVapidDetails("mailto:example@yourdomain.org", config_1.default.webpush.VAPID_PUBLIC, config_1.default.webpush.VAPID_PRIVATE);
    }
    async sendPushNotification(subscription, payload, options) {
        common_1.Logger.debug(payload);
        return web_push_1.sendNotification(subscription, JSON.stringify(payload));
    }
};
PushNotificationService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], PushNotificationService);
exports.PushNotificationService = PushNotificationService;
//# sourceMappingURL=push-notification.service.js.map