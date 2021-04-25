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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LeadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const lead_upload_interface_1 = require("../bull-queue/processors/lead-upload.interface");
const campaign_interface_1 = require("../campaign/interfaces/campaign.interface");
const admin_actions_interface_1 = require("../user/interfaces/admin-actions.interface");
const renameJson_1 = require("../utils/renameJson");
const xlsx_1 = require("xlsx");
const parseExcel_1 = require("../utils/parseExcel");
const upload_service_1 = require("./upload.service");
const push_notification_service_1 = require("./push-notification.service");
const sendMail_1 = require("../utils/sendMail");
const alerts_gateway_1 = require("../socks/alerts.gateway");
let LeadService = LeadService_1 = class LeadService {
    constructor(leadModel, adminActionModel, campaignConfigModel, campaignModel, userModel, s3UploadService, pushNotificationService, emailService, alertsGateway) {
        this.leadModel = leadModel;
        this.adminActionModel = adminActionModel;
        this.campaignConfigModel = campaignConfigModel;
        this.campaignModel = campaignModel;
        this.userModel = userModel;
        this.s3UploadService = s3UploadService;
        this.pushNotificationService = pushNotificationService;
        this.emailService = emailService;
        this.alertsGateway = alertsGateway;
        this.logger = new common_1.Logger(LeadService_1.name, true);
    }
    async uploadMultipleLeadFiles(data) {
        this.logger.debug({ campaignId: data.campaignId });
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
                text: 'No unique attribute found, please check unique cols section of campaign configuration',
            });
            throw new common_1.NotAcceptableException(null, 'No unique attribute found, please check unique cols section of campaign configuration');
        }
        const ccnfg = await this.campaignConfigModel
            .find({ campaignId: data.campaignId }, { readableField: 1, internalField: 1, _id: 0 })
            .lean()
            .exec();
        this.logger.debug({ ccnfg: JSON.stringify(ccnfg) });
        if (!ccnfg) {
            throw new Error(`Campaign with name ${data.campaignName} not found, create a campaign before uploading leads for that campaign`);
        }
        await this.adminActionModel.create({
            userid: data.userId,
            organization: data.organization,
            actionType: 'lead',
            filePath: data.files[0].Location,
            savedOn: 's3',
            campaign: data.campaignId,
            fileType: 'lead',
        });
        this.logger.debug('Saving this action to adminActions model');
        const result = await this.parseLeadFiles(data.files, ccnfg, data.campaignName, data.organization, data.uploader, data.userId, data.pushtoken, data.campaignId, uniqueAttr);
        this.logger.debug('Lead files parsed successfully');
        return { files: data.files, result };
    }
    async parseLeadFiles(files, ccnfg, campaignName, organization, uploader, uploaderId, pushtoken, campaignId, uniqueAttr) {
        this.alertsGateway.sendMessageToClient({
            room: uploader,
            text: 'Received file for processing',
        });
        files.forEach(async (file) => {
            const jsonRes = await parseExcel_1.default(file.Location, ccnfg);
            await this.saveLeadsFromExcel(jsonRes, campaignName, file.Key, organization, uploader, uploaderId, pushtoken, campaignId, uniqueAttr);
        });
    }
    async saveLeadsFromExcel(leads, campaignName, originalFileName, organization, uploader, uploaderId, pushtoken, campaignId, uniqueAttr) {
        const created = [];
        const updated = [];
        const error = [];
        const handlers = await this.userModel
            .find({ organization, roleType: { $ne: 'admin' } }, { email: 1 })
            .lean()
            .exec();
        const handlerEmails = handlers.map(h => h.email);
        console.log("handlers in the organization", handlerEmails);
        const mobileObjs = await this.campaignConfigModel.find({ type: 'tel' }).lean().exec();
        const mobileKeys = mobileObjs.map(m => m.internalField);
        const bulkOps = [];
        leads.forEach(lead => {
            try {
                let findByQuery = {};
                if (!handlerEmails.includes(lead.email)) {
                    delete lead.email;
                }
                else {
                    this.logger.debug("Found this lead with assigned user", lead.firstName);
                }
                if (!lead.mobilePhone) {
                    console.log('No mobile phone provided for lead', { lead });
                    return;
                }
                mobileKeys.forEach(mkey => {
                    lead[mkey] = lead[mkey] + "";
                    lead[mkey] = lead[mkey].replace(/\s/g, '');
                    if (!lead[mkey].startsWith('+91') &&
                        lead[mkey].length === 10) {
                        lead[mkey] = '+91' + lead[mkey];
                    }
                });
                uniqueAttr.uniqueCols.forEach(col => {
                    findByQuery[col] = lead[col];
                });
                findByQuery['campaignId'] = campaignId;
                Object.keys(findByQuery).forEach(key => {
                    delete lead[key];
                });
                bulkOps.push({
                    updateOne: {
                        filter: findByQuery,
                        update: Object.assign(Object.assign({}, lead), { campaign: campaignName, organization,
                            uploader,
                            campaignId }),
                        upsert: true,
                    },
                });
            }
            catch (e) {
                console.log("lead with error : ", lead);
                this.logger.debug(e);
            }
        });
        const response = await this.leadModel.bulkWrite(bulkOps, { ordered: false });
        this.logger.debug(response);
        const created_ws = xlsx_1.utils.json_to_sheet(created);
        const updated_ws = xlsx_1.utils.json_to_sheet(updated);
        const wb = xlsx_1.utils.book_new();
        xlsx_1.utils.book_append_sheet(wb, updated_ws, 'updated leads');
        xlsx_1.utils.book_append_sheet(wb, created_ws, 'created leads');
        const wbOut = xlsx_1.write(wb, {
            bookType: 'xlsx',
            type: 'buffer',
        });
        const fileName = `result-${originalFileName}`;
        this.logger.debug('Generated result file and store it to ', fileName);
        const result = await this.s3UploadService.uploadFileBuffer(fileName, wbOut);
        this.emailService.sendMail({
            to: uploader,
            subject: 'Lead file Results have been uploaded',
            text: `You can find a copy of your lead output file here: ${result.Location}`,
        });
        this.logger.error('Uploaded result file to s3');
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
        this.pushNotificationService
            .sendPushNotification(pushtoken, {
            notification: {
                title: 'File Upload Complete',
                icon: `https://cdn3.vectorstock.com/i/1000x1000/94/72/cute-black-cat-icon-vector-13499472.jpg`,
                body: `please visit ${result.Location} for the result`,
                tag: 'some random tag',
                badge: `https://e7.pngegg.com/pngimages/564/873/png-clipart-computer-icons-education-molecule-icon-structure-area.png`,
            },
        })
            .then(result => {
            this.logger.verbose('successfully notified user');
        }, error => {
            this.logger.error('Failed to notified user about file upload');
        });
        return result;
    }
    async distributeLeads(campaign, assignees) {
        const totalLeads = await this.leadModel
            .countDocuments({
            email: null,
            campaignId: campaign,
        })
            .catch(e => {
            this.logger.debug('An error occured while getting lead count');
        });
        if (!totalLeads) {
            throw new common_1.NotFoundException('No leads match the given criteria');
        }
        const limit = totalLeads / assignees.length;
        let currentIndex = 0;
        let currentAssignee = assignees[currentIndex];
        while (currentIndex < assignees.length) {
            await this.leadModel
                .updateMany({
                campaignId: campaign,
                email: null,
            }, { email: currentAssignee })
                .skip(currentIndex * limit)
                .limit(limit)
                .lean()
                .exec()
                .catch(e => {
                this.logger.debug('An error occured while trying to distribute leads');
            });
            currentAssignee = assignees[++currentIndex];
        }
    }
};
LeadService = LeadService_1 = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('Lead')),
    __param(1, mongoose_1.InjectModel('AdminAction')),
    __param(2, mongoose_1.InjectModel('CampaignConfig')),
    __param(3, mongoose_1.InjectModel('Campaign')),
    __param(4, mongoose_1.InjectModel('User')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        upload_service_1.UploadService,
        push_notification_service_1.PushNotificationService,
        sendMail_1.EmailService,
        alerts_gateway_1.AlertsGateway])
], LeadService);
exports.LeadService = LeadService;
//# sourceMappingURL=lead.service.js.map