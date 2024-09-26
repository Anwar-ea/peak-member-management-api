import { NotificationTypes } from "../../enums/notification-types.enum";

export interface INotificationRequest {
    description: string;
    type: NotificationTypes;
    expirationDate: Date;
}