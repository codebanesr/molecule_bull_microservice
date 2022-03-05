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
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const web_push_1 = require("web-push");
const firebase_admin_1 = require("firebase-admin");
const config_1 = require("../config");
const firebaseAdminConfig = {
    "type": "service_account",
    "project_id": "applesauce-crm",
    "private_key_id": "ca178c44f1bf59c7437fa881f94031a6f0a4badb",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDD/Lk8CkTaGtnC\nPN24lzjTa4aWwRMPqv8Eme4sDYPI0Ll6OYpyfAuuFkbdC31pLzyhj5p6Ovv98SP8\nbBDdiJcH61Kjx97/a/C4UDGiJ8z3hRwNvSHdqtG0rfBJjdE310hMGMr2kZIF2Ktl\n+ZXyDaS3CGxR/u4XTKol5gu2cX8tngn3xT6KHgk4kD3ZK9VrZV6WIjL9LFeXWl1h\n9N3y5iGPGp4ZKvMyYS7oLBw68Fap9Jt09FY23RbBcHo3Ot3dREJmYsn8H4ltNSMM\nhUEikpVZVsWd+qC2i0eZzhSaZNmIMbtuF/n1gav62CPQ2zVoQJQtuVolDaYcP8xx\nPQo0S9dFAgMBAAECggEABfzJDe1ZuCNnhq3EWk4oZXEcrgCyW+FYpCPYaQ51Tw5t\nXtoLgZQ06SRzasUIl6I3+HmXebzRPlX+cvORj6sLbimsHyZ33hbGm7g7eUg8/0zY\n6WSJ+H3Y+pZGcoDQz6NrPoPoDiCutNtZ39DVr2I8/NMsN/8RTV3sDsyt4UIrZVHS\ngsq8X0CtDJDYkrGWgOuNgxA6WKXZ/zxZfVurc9W1SxlUf1E6pskAz8VL//FGNq8+\nxvFvcfvTxyIyKo+7+DBdcnG4f0jkbHvVF8MsXjoVjLSrdIKkhh84wJwp2XXRavvz\n553Qt4XTJTLuZXWkgmc6jF9NWKixlBpTgNb6ydjpwQKBgQDgBqDR51I8etno80jC\narrlv10T9OyKyzGpc/9AQrc29ZlVLiBCBRiJwR6h7kGjY7Ml+8JvgUlHKVQLzJjy\nDo3FUBBBH7Eb90Np+xJsOqdzveep0l9dHewMoAXstJYC5IJT42Pu1F3Lgrh7S3uW\nSnvk/vFUVMIe76gciYPZDxxypQKBgQDf9aDl2Z8H7mtoinzznJCA5pKmF1U4Nhct\npf7jiumT6bN1Sd1egzrCgR4AT3XYjSOLUEtx9faivbocMKOD836CseMW6hr4p19g\nK8Z6oI57SUa59VHILQ8gD6K4C7KN04WbovKRVz3VIQ+/qBU7QCdmSe2r2MV6Plss\nfCbGMJ/QIQKBgA17WKJJMYHCQurp+S76DVVWNtvEmZegstRnzqynVy9PiHK/2+Ed\nPWTM4nMMS5bxoQ5gIEtllGtb6VrsbSfkCFQfhVrl9VqhfsUZ/vnUbc9hVle5+VM5\nQcNgvfqIw55Y8h7qSFFPJnXg4AlLeZyJzvrw/MT+dNA3y/4rqGufpS6hAoGBALvj\n0JbFGnyG86mC9g1TPpBF4KZjUOWVy6BKcSro8clb+WjfDU8rfXKM7GSKRW3mCvnn\n5UO4fLBPyAG6dJRRBcQUBVbGFNajZIrEbwGWDbM06Jc+TtxHoTbepz8M4UHHQYIv\nFJ4GuSNDV3kNRLKuwd85CqJvfE1wXwFVLxp61LjBAoGBAJ76T8Sc9AvYiTy6hg8u\n9pNRG1Le8BMvLt89qu2JXab+u9PFltDFO/pInWSZWyZJxz/UtWl7+5IGeh3D/bOH\n4XWjS4UoRPawn7rIBaouoUyrTmL3doUnh0qkcpiNMqTolTTusr1gt47xPfe8CoHO\n/5lTuibHec+SEhhSH/l5zkRx\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-jx8f4@applesauce-crm.iam.gserviceaccount.com",
    "client_id": "111939127334917263695",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jx8f4%40applesauce-crm.iam.gserviceaccount.com"
};
let PushNotificationService = class PushNotificationService {
    constructor() {
        web_push_1.setVapidDetails("mailto:example@yourdomain.org", config_1.default.webpush.VAPID_PUBLIC, config_1.default.webpush.VAPID_PRIVATE);
        try {
            firebase_admin_1.initializeApp({
                serviceAccountId: "firebase-adminsdk-gknej@applesauce-crm.iam.gserviceaccount.com",
                projectId: firebaseAdminConfig.project_id,
                credential: firebase_admin_1.credential.cert({
                    clientEmail: firebaseAdminConfig.client_email,
                    privateKey: firebaseAdminConfig.private_key,
                    projectId: firebaseAdminConfig.project_id,
                })
            });
        }
        catch (e) {
            console.log(e);
        }
    }
    async sendPushNotification(subscription, payload, options) {
        common_1.Logger.debug(payload);
        return web_push_1.sendNotification(subscription, JSON.stringify(payload));
    }
    async sendPNToMobileDevice(firebaseToken, payload, options) {
        await firebase_admin_1.messaging().sendToDevice(firebaseToken, payload, options);
        common_1.Logger.log("Successfully sent push notification");
    }
};
PushNotificationService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], PushNotificationService);
exports.PushNotificationService = PushNotificationService;
//# sourceMappingURL=push-notification.service.js.map