import { NotificationTypes } from "../../enums";
import { IAccountResponseBase } from "./response-base";

export interface INotificationResponse extends IAccountResponseBase {
    description: string;
    type: NotificationTypes;
    expirationDate: Date;
}