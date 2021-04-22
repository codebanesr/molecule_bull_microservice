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
exports.LeadUploadProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const lead_service_1 = require("../../lead/lead.service");
let LeadUploadProcessor = class LeadUploadProcessor {
    constructor(leadService) {
        this.leadService = leadService;
        this.logger = new common_1.Logger('Lead Queue');
    }
    async uploadLeads(job) {
        this.logger.debug('started processing lead');
        await this.leadService.uploadMultipleLeadFiles(job.data);
        this.logger.debug("Finished processing leads");
    }
    onActive(job) {
        common_1.Logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
    }
    onStalled() {
        common_1.Logger.debug('Processor is stalled');
    }
};
__decorate([
    bull_1.Process(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadUploadProcessor.prototype, "uploadLeads", null);
__decorate([
    bull_1.OnQueueActive(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeadUploadProcessor.prototype, "onActive", null);
__decorate([
    bull_1.OnQueueStalled(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeadUploadProcessor.prototype, "onStalled", null);
LeadUploadProcessor = __decorate([
    bull_1.Processor('leadQ'),
    __metadata("design:paramtypes", [lead_service_1.LeadService])
], LeadUploadProcessor);
exports.LeadUploadProcessor = LeadUploadProcessor;
//# sourceMappingURL=lead-upload.processor.js.map