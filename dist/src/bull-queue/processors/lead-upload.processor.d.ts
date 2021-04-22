import { Job } from 'bull';
import { FileUploadJob } from './lead-upload.interface';
import { LeadService } from '../../lead/lead.service';
export declare class LeadUploadProcessor {
    private leadService;
    private readonly logger;
    constructor(leadService: LeadService);
    uploadLeads(job: Job<FileUploadJob>): Promise<void>;
    onActive(job: Job): void;
    onStalled(): void;
}
