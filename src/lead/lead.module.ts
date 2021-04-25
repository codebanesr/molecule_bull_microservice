import { Module } from "@nestjs/common";
import { LeadService } from "./lead.service";
import { MongooseModule } from "@nestjs/mongoose";
import { LeadSchema } from "./schema/lead.schema";
import { CampaignConfigSchema } from "./schema/campaign-config.schema";
import { CampaignSchema } from "../campaign/schema/campaign.schema";
import { MulterModule } from "@nestjs/platform-express";
import { AdminActionSchema } from "../user/schemas/admin-action.schema";
import { UploadService } from "./upload.service";
import { PushNotificationService } from "./push-notification.service";
import { EmailService } from "../utils/sendMail";
import { AlertsGateway } from "../socks/alerts.gateway";
import { UserSchema } from "../user/schemas/user.schema";


@Module({
  imports: [
    MulterModule.register({
      dest: "~/.upload",
    }),
    MongooseModule.forFeature([
      { name: "Campaign", schema: CampaignSchema },
      { name: "User", schema: UserSchema },
      { name: "CampaignConfig", schema: CampaignConfigSchema },
      { name: "Lead", schema: LeadSchema },
      { name: "AdminAction", schema: AdminActionSchema },
    ]),
  ],
  providers: [
    LeadService, 
    UploadService, 
    PushNotificationService, 
    EmailService,
    AlertsGateway
  ],
  controllers: [],
  exports: [
    LeadService, UploadService, PushNotificationService
  ]
})
export class LeadModule {}