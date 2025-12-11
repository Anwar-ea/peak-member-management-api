import { Notification } from "../../entities/notification";
import { INotificationRequest } from "../../models/inerfaces/request/notification-request";
import { INotificationResponse } from "../../models/inerfaces/response/notification-response";
import { IServiceBase } from "./service-base";
import { ITokenUser } from "../../models";

export interface INotificationService extends IServiceBase<INotificationRequest, INotificationResponse, Notification> {
    toggleArchive(id: string, payload: { active: boolean }, contextUser: ITokenUser): Promise<void>;
}