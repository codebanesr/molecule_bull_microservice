import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, NativeError } from 'mongoose';
import { S3UploadedFiles } from 'src/bull-queue/processors/lead-upload.interface';
import { Campaign } from 'src/campaign/interfaces/campaign.interface';
import { AdminAction } from 'src/user/interfaces/admin-actions.interface';
import { IConfig } from 'src/utils/renameJson';
import { CampaignConfig } from './interfaces/campaign-config.interface';
import { Lead } from './interfaces/lead.interface';
import { utils, write } from 'xlsx';
import parseExcel from '../utils/parseExcel';
import { UploadService } from './upload.service';
import { PushNotificationService } from './push-notification.service';
import { EmailService } from '../utils/sendMail';
import { AlertsGateway } from '../socks/alerts.gateway';
import { UserActivityDto } from 'src/user/dto/user-activity.dto';
import { isMobilePhone } from 'class-validator';

interface LeadFileUpload {
  files: S3UploadedFiles[];
  campaignName: string;
  uploader: string;
  organization: string;
  userId: string;
  pushtoken: any;
  firebaseToken?: string;
  campaignId: string;
}
@Injectable()
export class LeadService {
  constructor(
    @InjectModel('Lead')
    private readonly leadModel: Model<Lead>,

    @InjectModel('AdminAction')
    private readonly adminActionModel: Model<AdminAction>,

    @InjectModel('CampaignConfig')
    private readonly campaignConfigModel: Model<CampaignConfig>,

    @InjectModel('Campaign')
    private readonly campaignModel: Model<Campaign>,

    private readonly s3UploadService: UploadService,

    private readonly pushNotificationService: PushNotificationService,

    private emailService: EmailService,

    private alertsGateway: AlertsGateway,
  ) {}

  private logger = new Logger(LeadService.name, true);

  async uploadMultipleLeadFiles(data: LeadFileUpload) {
    const uniqueAttr = await this.campaignModel
      .findOne({ _id: data.campaignId }, { uniqueCols: 1 })
      .lean()
      .exec();

    this.alertsGateway.sendMessageToClient({
      room: data.uploader,
      text: 'File upload started',
    });
    if (!uniqueAttr) {
      this.alertsGateway.sendMessageToClient({
        room: data.uploader,
        text:
          'No unique attribute found, please check unique cols section of campaign configuration',
      });

      throw new NotAcceptableException(
        null,
        'No unique attribute found, please check unique cols section of campaign configuration',
      );
    }

    const ccnfg = await this.campaignConfigModel
      .find(
        { campaignId: data.campaignId },
        { readableField: 1, internalField: 1, _id: 0 },
      )
      .lean()
      .exec();
    this.logger.debug({ccnfg: JSON.stringify(ccnfg)})

    if (!ccnfg) {
      throw new Error(
        `Campaign with name ${data.campaignName} not found, create a campaign before uploading leads for that campaign`,
      );
    }

    await this.adminActionModel.create({
      userid: data.userId,
      organization: data.organization,
      actionType: 'lead',
      filePath: data.files[0].Location,
      savedOn: 's3',
      campaign: data.campaignId,
      fileType: 'lead'
    });

    this.logger.debug('Saving this action to adminActions model');

    const result = await this.parseLeadFiles(
      data.files,
      ccnfg,
      data.campaignName,
      data.organization,
      data.uploader,
      data.userId,
      data.pushtoken,
      data.campaignId,
      uniqueAttr,
      data.firebaseToken
    );

    this.logger.debug('Lead files parsed successfully');
    // parse data here
    return { files: data.files, result };
  }

  async parseLeadFiles(
    files: S3UploadedFiles[],
    ccnfg: IConfig[],
    campaignName: string,
    organization: string,
    uploader: string,
    uploaderId: string,
    pushtoken: string,
    campaignId: string,
    uniqueAttr: Partial<Campaign>,
    firebaseToken?: string
  ) {
    this.alertsGateway.sendMessageToClient({
      room: uploader,
      text: 'Received file for processing',
    });
    files.forEach(async file => {
      const jsonRes = await parseExcel(file.Location, ccnfg);
      await this.saveLeadsFromExcel(
        jsonRes,
        campaignName,
        file.Key,
        organization,
        uploader,
        uploaderId,
        pushtoken,
        campaignId,
        uniqueAttr,
        firebaseToken
      );
    });
  }

  async saveLeadsFromExcel(
    leads: Lead[],
    campaignName: string,
    originalFileName: string,
    organization: string,
    uploader: string,
    uploaderId: string,
    pushtoken,
    campaignId: string,
    uniqueAttr: Partial<Campaign>,
    firebaseToken?: string
  ) {
    const created = [];
    const updated = [];
    const error = [];

    // const leadMappings = keyBy(leadColumns, "internalField");
    console.log("extracted leads", JSON.stringify(leads))
    for (let lead of leads){
      try {
        Object.keys(lead).forEach(lk=>{
          if(!lead[lk]) {
            delete lead[lk];
          }
        });

        const findByQuery = {};
        if(!lead.mobilePhone) {
          continue;
        }
        // excel file can send a number as well for mobile phone, so i am converting them to string
        lead.mobilePhone +="";
        lead.mobilePhone = lead.mobilePhone.replace(/\s/g, "");
        if(!lead.mobilePhone.startsWith("+91") && lead.mobilePhone.length === 10) {
          lead.mobilePhone = "+91"+lead.mobilePhone;
        }
        uniqueAttr.uniqueCols.forEach(col => {
          findByQuery[col] = lead[col];
        }); 
        findByQuery['campaignId'] = campaignId;

        this.logger.debug(findByQuery)
        const { lastErrorObject, value } = await this.leadModel
          .findOneAndUpdate(
            findByQuery,
            {
              ...lead,
              campaign: campaignName,
              organization,
              uploader,
              campaignId,
            },
            { new: true, upsert: true, rawResult: true },
          )
          .lean()
          .exec();
        if (lastErrorObject.updatedExisting === true) {
          updated.push(value);
        } else if (lastErrorObject.upserted) {
          created.push(value);
        } else {
          error.push(value);
        }
      } catch (e) {
        this.logger.error(e);
        error.push(e.message)
      }
    }

    // createExcel files and update them to aws and then store the urls in database with AdminActions
    const created_ws = utils.json_to_sheet(created);
    const updated_ws = utils.json_to_sheet(updated);

    const wb = utils.book_new();
    utils.book_append_sheet(wb, updated_ws, 'updated leads');
    utils.book_append_sheet(wb, created_ws, 'created leads');

    // writeFile(wb, originalFileName + "_system");
    const wbOut = write(wb, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    const fileName = `result-${originalFileName}`;
    this.logger.debug('Generated result file and store it to ', fileName);
    const result = await this.s3UploadService.uploadFileBuffer(fileName, wbOut).catch(e =>{
      this.logger.debug("failed to upload file to s3")
    });
    this.logger.error('Uploaded result file to s3');

    try {
      this.emailService.sendMail({
        to: uploader,
        subject: 'Lead file Results have been uploaded',
        text: `You can find a copy of your lead output file here: ${result.Location}`,
      });
    } catch(e) {
      this.logger.debug(e.message);
    }

    await this.adminActionModel.create({
      userid: uploaderId,
      organization,
      actionType: 'lead',
      filePath: result.Location,
      savedOn: 's3',
      fileType: 'lead-log',
      campaign: campaignId,
    });

    this.alertsGateway.sendMessageToClient({
      room: uploader,
      text: 'Your file has been successfully uploaded',
    });

    this.logger.debug("Firebase token", firebaseToken);
    if(firebaseToken) {
      await this.pushNotificationService.sendPNToMobileDevice(firebaseToken, {
        data: {
          icon: "https://cdn3.vectorstock.com/i/1000x1000/94/72/cute-black-cat-icon-vector-13499472.jpg",
          badge: `https://e7.pngegg.com/pngimages/564/873/png-clipart-computer-icons-education-molecule-icon-structure-area.png`,
        },
        notification: {
          title: "File Uploaded",
          body: `Please visit ${result.Location} for the result`
        }
      }).catch(e => {
        this.logger.debug(e)
      });
    }

    await this.pushNotificationService
      .sendPushNotification(pushtoken, {
        notification: {
          title: 'File Upload Complete',
          icon: `https://cdn3.vectorstock.com/i/1000x1000/94/72/cute-black-cat-icon-vector-13499472.jpg`,
          body: `please visit ${result.Location} for the result`,
          tag: 'some random tag',
          badge: `https://e7.pngegg.com/pngimages/564/873/png-clipart-computer-icons-education-molecule-icon-structure-area.png`,
        },
      });

    Logger.debug("Sent push notifications to mobile and web");
    return result;
  }

  /**
   * The { item : null } query matches documents that either contain the item field whose value is null or that do not contain the item field.
   * https://docs.mongodb.com/manual/tutorial/query-for-null-fields/
   */

  async distributeLeads(campaign: string, assignees: string[]) {
    const totalLeads = await this.leadModel
      .countDocuments({
        email: null,
        campaignId: campaign,
      })
      .catch(e => {
        this.logger.debug('An error occured while getting lead count');
      });

    if (!totalLeads) {
      throw new NotFoundException('No leads match the given criteria');
    }

    const limit = totalLeads / assignees.length;
    let currentIndex = 0;
    let currentAssignee = assignees[currentIndex];
    while (currentIndex < assignees.length) {
      await this.leadModel
        .updateMany(
          {
            campaignId: campaign,
            email: null,
          },
          { email: currentAssignee },
        )
        .skip(currentIndex * limit)
        .limit(limit)
        .lean()
        .exec()
        .catch(e => {
          this.logger.debug(
            'An error occured while trying to distribute leads',
          );
        });

      currentAssignee = assignees[++currentIndex];
    }
  }
}
