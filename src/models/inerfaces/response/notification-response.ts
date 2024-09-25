import { NotificationTypes } from "../../enums/notification-types.enum";
import { IAccountResponseBase } from "./response-base";

export interface INotificationResponse extends IAccountResponseBase {
    description: string;
    type: NotificationTypes;
    expirationDate: Date;
}