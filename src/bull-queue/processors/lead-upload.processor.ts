import { Processor, Process, OnQueueActive } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";

@Processor('leadUpload')
export class LeadUploadProcessor {
    @Process()
    async transcode(job: Job<unknown>) {
        let progress = 0;
        for (let i = 0; i < 100; i++) {
            console.log("processing stuff");
            progress += 10;
            job.progress(progress);
        }
        return {};
    }


    @OnQueueActive()
    onActive(job: Job) {
        Logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
    }
}