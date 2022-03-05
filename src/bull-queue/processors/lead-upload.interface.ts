export interface S3UploadedFiles {    
    "Location": string,
    "key": string,
    "Key": string,
    "Bucket": string
}
export interface FileUploadJob {
    files: S3UploadedFiles[],
    campaignName: string,
    uploader: string,
    organization: string,
    userId: string,
    pushtoken: any,
    campaignId: string,
    firebaseToken?: string
}