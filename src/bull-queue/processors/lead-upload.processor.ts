import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueStalled,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { FileUploadJob, S3UploadedFiles } from './lead-upload.interface';

import { LeadService } from '../../lead/lead.service';
@Processor('leadQ')
export class LeadUploadProcessor {
  private readonly logger = new Logger('Lead Queue');
  
  constructor(
    private leadService: LeadService
  ) {}

  @Process()
  async uploadLeads(job: Job<FileUploadJob>) {
    this.logger.debug('started processing lead');
    await this.leadService.uploadMultipleLeadFiles(job.data);


    this.logger.debug("Finished processing leads");
  }

  @OnQueueActive()
  onActive(job: Job) {
    Logger.debug(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueStalled()
  onStalled() {
    Logger.debug('Processor is stalled');
  }
}
