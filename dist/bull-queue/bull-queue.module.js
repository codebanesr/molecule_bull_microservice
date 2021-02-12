"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullQueueModule = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const dotenv_1 = require("dotenv");
const campaign_schema_1 = require("../campaign/schema/campaign.schema");
const lead_module_1 = require("../lead/lead.module");
const campaign_config_schema_1 = require("../lead/schema/campaign-config.schema");
const lead_schema_1 = require("../lead/schema/lead.schema");
const admin_action_schema_1 = require("../user/schemas/admin-action.schema");
const lead_upload_processor_1 = require("./processors/lead-upload.processor");
dotenv_1.config();
let BullQueueModule = class BullQueueModule {
};
BullQueueModule = __decorate([
    common_1.Module({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'leadQ',
                redis: {
                    name: 'BullQueueWorker',
                    host: process.env.BULL_REDIS_URL,
                    port: +process.env.BULL_REDIS_PORT,
                    password: process.env.BULL_REDIS_PASSWORD
                }
            }),
            lead_module_1.LeadModule,
            mongoose_1.MongooseModule.forFeature([
                { name: "Campaign", schema: campaign_schema_1.CampaignSchema },
                { name: "CampaignConfig", schema: campaign_config_schema_1.CampaignConfigSchema },
                { name: "Lead", schema: lead_schema_1.LeadSchema },
                { name: "AdminAction", schema: admin_action_schema_1.AdminActionSchema },
            ]),
        ],
        controllers: [],
        providers: [lead_upload_processor_1.LeadUploadProcessor]
    })
], BullQueueModule);
exports.BullQueueModule = BullQueueModule;
//# sourceMappingURL=bull-queue.module.js.map