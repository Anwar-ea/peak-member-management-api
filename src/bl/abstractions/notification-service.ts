import { Notification } from "../../entities/notification";
import { INotificationRequest } from "../../models/inerfaces/request/notification-request";
import { INotificationResponse } from "../../models/inerfaces/response/notification-response";
import { IServiceBase } from "./service-base";

export interface INotificationService extends IServiceBase<INotificationRequest, INotificationResponse, Notification> {
    
}