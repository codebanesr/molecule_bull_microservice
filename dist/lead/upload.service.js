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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
const config_1 = require("../config");
let UploadService = class UploadService {
    constructor() {
        this.bucket = new aws_sdk_1.S3({
            accessKeyId: config_1.default.s3.accessKeyId,
            secretAccessKey: config_1.default.s3.secretAccessKey,
            region: config_1.default.s3.region,
        });
        this.bucketName = "applesaucecrm";
    }
    async uploadFile(key, file) {
        const params = {
            Bucket: this.bucketName,
            Key: key + file.name,
            Body: file,
        };
        return new Promise((resolve, reject) => {
            this.bucket.upload(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    async uploadFileBuffer(key, fileBuffer) {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: fileBuffer,
        };
        return this.bucket.upload(params).promise();
    }
};
UploadService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], UploadService);
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map