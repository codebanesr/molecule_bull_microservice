"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadModule = void 0;
const common_1 = require("@nestjs/common");
const lead_service_1 = require("./lead.service");
const mongoose_1 = require("@nestjs/mongoose");
const lead_schema_1 = require("./schema/lead.schema");
const campaign_config_schema_1 = require("./schema/campaign-config.schema");
const campaign_schema_1 = require("../campaign/schema/campaign.schema");
const platform_express_1 = require("@nestjs/platform-express");
const admin_action_schema_1 = require("../user/schemas/admin-action.schema");
const upload_service_1 = require("./upload.service");
const push_notification_service_1 = require("./push-notification.service");
const sendMail_1 = require("../utils/sendMail");
const alerts_gateway_1 = require("../socks/alerts.gateway");
const user_schema_1 = require("../user/schemas/user.schema");
let LeadModule = class LeadModule {
};
LeadModule = __decorate([
    common_1.Module({
        imports: [
            platform_express_1.MulterModule.register({
                dest: "~/.upload",
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: "Campaign", schema: campaign_schema_1.CampaignSchema },
                { name: "User", schema: user_schema_1.UserSchema },
                { name: "CampaignConfig", schema: campaign_config_schema_1.CampaignConfigSchema },
                { name: "Lead", schema: lead_schema_1.LeadSchema },
                { name: "AdminAction", schema: admin_action_schema_1.AdminActionSchema },
            ]),
        ],
        providers: [
            lead_service_1.LeadService,
            upload_service_1.UploadService,
            push_notification_service_1.PushNotificationService,
            sendMail_1.EmailService,
            alerts_gateway_1.AlertsGateway
        ],
        controllers: [],
        exports: [
            lead_service_1.LeadService, upload_service_1.UploadService, push_notification_service_1.PushNotificationService
        ]
    })
], LeadModule);
exports.LeadModule = LeadModule;
//# sourceMappingURL=lead.module.js.map