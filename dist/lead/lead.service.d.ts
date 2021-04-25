import { Model } from 'mongoose';
import { S3UploadedFiles } from 'src/bull-queue/processors/lead-upload.interface';
import { Campaign } from 'src/campaign/interfaces/campaign.interface';
import { AdminAction } from 'src/user/interfaces/admin-actions.interface';
import { IConfig } from 'src/utils/renameJson';
import { CampaignConfig } from './interfaces/campaign-config.interface';
import { Lead } from './interfaces/lead.interface';
import { UploadService } from './upload.service';
import { PushNotificationService } from './push-notification.service';
import { EmailService } from '../utils/sendMail';
import { AlertsGateway } from '../socks/alerts.gateway';
import { User } from '../user/interfaces/user.interface';
interface LeadFileUpload {
    files: S3UploadedFiles[];
    campaignName: string;
    uploader: string;
    organization: string;
    userId: string;
    pushtoken: any;
    campaignId: string;
}
export declare class LeadService {
    private readonly leadModel;
    private readonly adminActionModel;
    private readonly campaignConfigModel;
    private readonly campaignModel;
    private readonly userModel;
    private readonly s3UploadService;
    private readonly pushNotificationService;
    private emailService;
    private alertsGateway;
    constructor(leadModel: Model<Lead>, adminActionModel: Model<AdminAction>, campaignConfigModel: Model<CampaignConfig>, campaignModel: Model<Campaign>, userModel: Model<User>, s3UploadService: UploadService, pushNotificationService: PushNotificationService, emailService: EmailService, alertsGateway: AlertsGateway);
    private logger;
    uploadMultipleLeadFiles(data: LeadFileUpload): Promise<{
        files: S3UploadedFiles[];
        result: void;
    }>;
    parseLeadFiles(files: S3UploadedFiles[], ccnfg: IConfig[], campaignName: string, organization: string, uploader: string, uploaderId: string, pushtoken: string, campaignId: string, uniqueAttr: Partial<Campaign>): Promise<void>;
    saveLeadsFromExcel(leads: Lead[], campaignName: string, originalFileName: string, organization: string, uploader: string, uploaderId: string, pushtoken: any, campaignId: string, uniqueAttr: Partial<Campaign>): Promise<any>;
    generateExcelFileFromBulkResponse(bulkOps: any[]): Promise<any>;
    distributeLeads(campaign: string, assignees: string[]): Promise<void>;
}
export {};
