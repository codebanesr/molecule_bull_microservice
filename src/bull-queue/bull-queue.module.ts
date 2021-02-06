import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config as loadEnvConfig } from 'dotenv';
import { CampaignSchema } from '../campaign/schema/campaign.schema';
import { LeadModule } from '../lead/lead.module';
import { CampaignConfigSchema } from '../lead/schema/campaign-config.schema';
import { LeadSchema } from '../lead/schema/lead.schema';
import { AdminActionSchema } from '../user/schemas/admin-action.schema';
import { LeadUploadProcessor } from './processors/lead-upload.processor';

loadEnvConfig();

@Module({
  imports: [
    BullModule.registerQueue({
      /** 
       * A queue name is used as both an injection token (for injecting the queue into controllers/providers), 
       * and as an argument to decorators to associate consumer classes and listeners with queues.
      */
      name: 'leadQ',
      redis: {
        name: 'BullQueueWorker',
        host: process.env.BULL_REDIS_URL,
        port: +process.env.BULL_REDIS_PORT,
        password: process.env.BULL_REDIS_PASSWORD
      }
    }),
    LeadModule,
    MongooseModule.forFeature([
      { name: "Campaign", schema: CampaignSchema },
      { name: "CampaignConfig", schema: CampaignConfigSchema },
      { name: "Lead", schema: LeadSchema },
      { name: "AdminAction", schema: AdminActionSchema },
    ]),
  ],
  controllers: [],
  providers: [LeadUploadProcessor]
})
export class BullQueueModule {}
