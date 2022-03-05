/// <reference types="node" />
import { RequestOptions, PushSubscription, SendResult } from "web-push";
import { MessagingOptions } from 'child_process';
import { MessagingPayload } from 'firebase-admin/lib/messaging/messaging-api';
export declare class PushNotificationService {
    constructor();
    sendPushNotification(subscription: PushSubscription, payload?: string | Buffer | null | Record<string, any>, options?: RequestOptions): Promise<SendResult>;
    sendPNToMobileDevice(firebaseToken: string, payload: MessagingPayload, options?: MessagingOptions): Promise<void>;
}
